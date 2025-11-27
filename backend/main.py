from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from contextlib import asynccontextmanager

from app.config.settings import settings
from app.auth.routes import router as auth_router
from app.patients.routes import router as patients_router
from app.medications.routes import router as medications_router
from app.adherence.routes import router as adherence_router
from app.reminders.routes import router as reminders_router
from app.analytics import router as analytics_router
from app.database.init_db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown."""
    # Startup: Initialize database
    init_db()
    yield
    # Shutdown: cleanup if needed


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    lifespan=lifespan
)

# Configure Jinja2 templates
templates = Jinja2Templates(directory="templates")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS_LIST,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(patients_router)
app.include_router(medications_router)
app.include_router(adherence_router)
app.include_router(reminders_router)
app.include_router(analytics_router)


@app.get("/debug/tables")
async def get_database_tables():
    """Debug endpoint to get all table names and sample data."""
    from sqlalchemy import text
    from app.database.db import engine
    
    try:
        with engine.connect() as conn:
            # Get all table names
            result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table';"))
            tables = [row[0] for row in result.fetchall()]
            
            table_data = {}
            for table in tables:
                if table.startswith('sqlite_'):
                    continue
                    
                try:
                    # Get column info
                    columns_result = conn.execute(text(f"PRAGMA table_info({table});"))
                    columns = [row[1] for row in columns_result.fetchall()]
                    
                    # Get sample data (first 50 rows for better detail)
                    data_result = conn.execute(text(f"SELECT * FROM {table} LIMIT 50;"))
                    rows = [dict(zip(columns, row)) for row in data_result.fetchall()]
                    
                    # Get total count
                    count_result = conn.execute(text(f"SELECT COUNT(*) FROM {table};"))
                    count = count_result.fetchone()[0]
                    
                    table_data[table] = {
                        'columns': columns,
                        'sample_data': rows,
                        'total_count': count
                    }
                except Exception as e:
                    table_data[table] = {
                        'error': str(e),
                        'columns': [],
                        'sample_data': [],
                        'total_count': 0
                    }
            
            return {
                'tables': list(table_data.keys()),
                'data': table_data
            }
    except Exception as e:
        return {"error": str(e)}


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to MediTrack-AI API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
