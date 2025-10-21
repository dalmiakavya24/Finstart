from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# === Data Models ===

class Module(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    lessons_count: int
    order: int
    is_locked: bool = False

class Lesson(BaseModel):
    id: str
    module_id: str
    title: str
    content: str
    duration_minutes: int
    examples: List[Dict[str, Any]]
    quiz_questions: List[Dict[str, Any]]
    simulation_type: Optional[str] = None
    daily_tip: str
    order: int

class UserProgress(BaseModel):
    user_id: str = "default_user"  # No signup required, using default
    completed_lessons: List[str] = []
    quiz_scores: Dict[str, float] = {}
    simulations_completed: List[str] = []
    last_active: datetime = Field(default_factory=datetime.utcnow)

class QuizSubmission(BaseModel):
    lesson_id: str
    answers: Dict[str, str]
    score: float

class SimulationResult(BaseModel):
    simulation_type: str
    inputs: Dict[str, Any]
    outputs: Dict[str, Any]

class LessonGenerateRequest(BaseModel):
    module_id: str
    topic: str
    difficulty: str = "beginner"

# === Helper Functions ===

def get_modules_data():
    """Return the 9 educational modules"""
    return [
        {
            "id": "money-basics",
            "title": "Money Basics",
            "description": "Understanding money, budgeting fundamentals, and financial goals",
            "icon": "💰",
            "lessons_count": 8,
            "order": 1,
            "is_locked": False
        },
        {
            "id": "budgeting-bills",
            "title": "Budgeting & Bills",
            "description": "Creating budgets, managing bills, and tracking expenses",
            "icon": "📊",
            "lessons_count": 6,
            "order": 2,
            "is_locked": False
        },
        {
            "id": "banking-products",
            "title": "Banking Products",
            "description": "Savings, current, fixed deposit accounts and banking services",
            "icon": "🏦",
            "lessons_count": 7,
            "order": 3,
            "is_locked": False
        },
        {
            "id": "credit-debt",
            "title": "Credit & Debt",
            "description": "Credit scores, credit cards, loans, and debt management",
            "icon": "💳",
            "lessons_count": 8,
            "order": 4,
            "is_locked": True
        },
        {
            "id": "savings-vehicles",
            "title": "Savings Vehicles",
            "description": "Emergency funds, saving strategies, and goal-based savings",
            "icon": "🎯",
            "lessons_count": 5,
            "order": 5,
            "is_locked": True
        },
        {
            "id": "investing-fundamentals",
            "title": "Investing Fundamentals",
            "description": "Mutual funds, SIPs, stocks, ETFs, and investment basics",
            "icon": "📈",
            "lessons_count": 10,
            "order": 6,
            "is_locked": True
        },
        {
            "id": "market-mechanics",
            "title": "Market Mechanics",
            "description": "How markets work, orders, indices, and trading basics",
            "icon": "🎢",
            "lessons_count": 8,
            "order": 7,
            "is_locked": True
        },
        {
            "id": "advanced-investing",
            "title": "Advanced Investing",
            "description": "Portfolio construction, diversification, and risk management",
            "icon": "🎓",
            "lessons_count": 9,
            "order": 8,
            "is_locked": True
        },
        {
            "id": "taxes-legal",
            "title": "Taxes & Legal",
            "description": "Tax basics, filing returns, legal saving instruments, and retirement",
            "icon": "📋",
            "lessons_count": 7,
            "order": 9,
            "is_locked": True
        }
    ]

async def generate_lesson_content(topic: str, difficulty: str = "beginner") -> Dict[str, Any]:
    """Generate lesson content using AI"""
    try:
        api_key = os.getenv('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"lesson_{topic}",
            system_message="You are a financial education expert creating engaging, practical lessons for ages 13-25. Focus on real-world examples, simple explanations, and actionable advice."
        ).with_model("openai", "gpt-4o-mini")
        
        prompt = f"""Create a comprehensive financial education lesson on: {topic}
        
Difficulty level: {difficulty}

Provide a JSON response with:
1. title: Clear, engaging title
2. content: 300-400 word educational content (2-5 min read)
3. key_points: 4-5 bullet points of main takeaways
4. real_example: A realistic scenario showing the concept in action
5. daily_tip: One specific, actionable tip they can implement today

Make it practical, relatable, and focused on empowering young people to make smart money decisions."""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse AI response
        import json
        try:
            lesson_data = json.loads(response)
        except:
            # If not JSON, create structured response
            lesson_data = {
                "title": topic,
                "content": response[:400],
                "key_points": ["Understand the basics", "Apply in real life", "Track progress"],
                "real_example": "Example scenario based on this concept.",
                "daily_tip": "Start small and stay consistent."
            }
        
        return lesson_data
    except Exception as e:
        logger.error(f"Error generating lesson: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate lesson: {str(e)}")

# === API Routes ===

@api_router.get("/")
async def root():
    return {"message": "FinStart API - Financial Education for Young Adults"}

@api_router.get("/modules", response_model=List[Module])
async def get_modules():
    """Get all learning modules"""
    modules = get_modules_data()
    return [Module(**m) for m in modules]

@api_router.get("/modules/{module_id}/lessons")
async def get_module_lessons(module_id: str):
    """Get all lessons for a specific module"""
    lessons = await db.lessons.find({"module_id": module_id}).to_list(100)
    # Remove MongoDB _id from each lesson
    for lesson in lessons:
        if "_id" in lesson:
            del lesson["_id"]
    return lessons

@api_router.get("/lessons/{lesson_id}")
async def get_lesson(lesson_id: str):
    """Get a specific lesson"""
    lesson = await db.lessons.find_one({"id": lesson_id})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    # Remove MongoDB _id
    if "_id" in lesson:
        del lesson["_id"]
    return lesson

@api_router.post("/lessons/generate")
async def generate_lesson(request: LessonGenerateRequest):
    """Generate a new lesson using AI"""
    lesson_content = await generate_lesson_content(request.topic, request.difficulty)
    
    # Create lesson object
    lesson_id = f"{request.module_id}_{request.topic.lower().replace(' ', '_')}"
    lesson = {
        "id": lesson_id,
        "module_id": request.module_id,
        "title": lesson_content.get("title", request.topic),
        "content": lesson_content.get("content", ""),
        "duration_minutes": 3,
        "key_points": lesson_content.get("key_points", []),
        "real_example": lesson_content.get("real_example", ""),
        "quiz_questions": [],
        "daily_tip": lesson_content.get("daily_tip", ""),
        "order": 1,
        "created_at": datetime.utcnow()
    }
    
    # Save to database
    await db.lessons.update_one(
        {"id": lesson_id},
        {"$set": lesson},
        upsert=True
    )
    
    return lesson

@api_router.get("/progress")
async def get_progress():
    """Get user progress"""
    progress = await db.progress.find_one({"user_id": "default_user"})
    if not progress:
        # Create default progress
        progress = {
            "user_id": "default_user",
            "completed_lessons": [],
            "quiz_scores": {},
            "simulations_completed": [],
            "last_active": datetime.utcnow()
        }
        await db.progress.insert_one(progress)
    
    # Remove MongoDB _id before returning
    if "_id" in progress:
        del progress["_id"]
    return progress

@api_router.post("/progress/complete-lesson/{lesson_id}")
async def complete_lesson(lesson_id: str):
    """Mark a lesson as completed"""
    result = await db.progress.update_one(
        {"user_id": "default_user"},
        {
            "$addToSet": {"completed_lessons": lesson_id},
            "$set": {"last_active": datetime.utcnow()}
        },
        upsert=True
    )
    return {"success": True, "lesson_id": lesson_id}

@api_router.post("/quiz/submit")
async def submit_quiz(submission: QuizSubmission):
    """Submit quiz answers and get score"""
    # Store quiz score
    await db.progress.update_one(
        {"user_id": "default_user"},
        {
            "$set": {
                f"quiz_scores.{submission.lesson_id}": submission.score,
                "last_active": datetime.utcnow()
            }
        },
        upsert=True
    )
    return {"score": submission.score, "lesson_id": submission.lesson_id}

@api_router.post("/simulations/calculate")
async def calculate_simulation(simulation: SimulationResult):
    """Run financial calculations/simulations"""
    sim_type = simulation.simulation_type
    inputs = simulation.inputs
    
    result = {}
    
    if sim_type == "compound_interest":
        principal = inputs.get("principal", 0)
        rate = inputs.get("rate", 0) / 100
        time = inputs.get("time", 0)
        frequency = inputs.get("frequency", 12)  # monthly
        
        amount = principal * (1 + rate/frequency) ** (frequency * time)
        interest = amount - principal
        
        result = {
            "final_amount": round(amount, 2),
            "interest_earned": round(interest, 2),
            "principal": principal,
            "total_return_percentage": round((interest/principal)*100, 2) if principal > 0 else 0
        }
    
    elif sim_type == "simple_interest":
        principal = inputs.get("principal", 0)
        rate = inputs.get("rate", 0) / 100
        time = inputs.get("time", 0)
        
        interest = principal * rate * time
        amount = principal + interest
        
        result = {
            "final_amount": round(amount, 2),
            "interest_earned": round(interest, 2),
            "principal": principal
        }
    
    elif sim_type == "emi_calculator":
        principal = inputs.get("principal", 0)
        rate = inputs.get("rate", 0) / 100 / 12  # monthly rate
        months = inputs.get("months", 0)
        
        if rate > 0:
            emi = principal * rate * (1 + rate)**months / ((1 + rate)**months - 1)
        else:
            emi = principal / months if months > 0 else 0
        
        total_payment = emi * months
        total_interest = total_payment - principal
        
        result = {
            "emi": round(emi, 2),
            "total_payment": round(total_payment, 2),
            "total_interest": round(total_interest, 2),
            "principal": principal
        }
    
    elif sim_type == "sip_calculator":
        monthly_investment = inputs.get("monthly_investment", 0)
        rate = inputs.get("rate", 0) / 100 / 12  # monthly rate
        months = inputs.get("months", 0)
        
        if rate > 0:
            future_value = monthly_investment * (((1 + rate)**months - 1) / rate) * (1 + rate)
        else:
            future_value = monthly_investment * months
        
        total_invested = monthly_investment * months
        returns = future_value - total_invested
        
        result = {
            "future_value": round(future_value, 2),
            "total_invested": round(total_invested, 2),
            "returns": round(returns, 2),
            "return_percentage": round((returns/total_invested)*100, 2) if total_invested > 0 else 0
        }
    
    elif sim_type == "budget_builder":
        income = inputs.get("income", 0)
        expenses = inputs.get("expenses", {})
        
        total_expenses = sum(expenses.values())
        savings = income - total_expenses
        savings_rate = (savings / income * 100) if income > 0 else 0
        
        result = {
            "income": income,
            "total_expenses": round(total_expenses, 2),
            "savings": round(savings, 2),
            "savings_rate": round(savings_rate, 2),
            "status": "surplus" if savings >= 0 else "deficit"
        }
    
    # Store simulation
    await db.simulations.insert_one({
        "user_id": "default_user",
        "simulation_type": sim_type,
        "inputs": inputs,
        "outputs": result,
        "created_at": datetime.utcnow()
    })
    
    return result

@api_router.get("/scenarios/{scenario_type}")
async def get_scenario(scenario_type: str, income: float = 50000, age: int = 20):
    """Get personalized financial scenario advice"""
    scenarios = {
        "student": {
            "title": "Student Financial Scenario",
            "advice": [
                "Focus on building emergency fund (3 months expenses)",
                "Start with small savings habit (10-20% of any income)",
                "Avoid unnecessary debt, especially consumer loans",
                "Learn about compound interest early"
            ],
            "suggested_actions": [
                "Open a basic savings account",
                "Track all expenses for one month",
                "Set up automatic savings transfer"
            ]
        },
        "first_job": {
            "title": "First Job Financial Scenario",
            "advice": [
                "Build 6-month emergency fund",
                "Start retirement savings immediately (even small amounts)",
                "Avoid lifestyle inflation",
                f"Save at least 20% of income: ₹{income * 0.2:.2f}"
            ],
            "suggested_actions": [
                "Set up automatic investment (SIP) of ₹500-1000/month",
                "Get health insurance",
                "Create and follow a budget"
            ]
        },
        "tax_planning": {
            "title": "Legal Tax Planning",
            "advice": [
                "Utilize Section 80C deductions (up to ₹1.5 lakh)",
                "Consider PPF, ELSS, or EPF contributions",
                "Keep records of all tax-saving investments",
                "File returns on time to avoid penalties"
            ],
            "disclaimer": "This is educational information only. Consult a tax professional for personalized advice. Never engage in tax evasion - it is illegal."
        }
    }
    
    scenario = scenarios.get(scenario_type, scenarios["student"])
    return scenario

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
