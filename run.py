import os
import sys
import webbrowser
import uvicorn

def main():
    print("=" * 70)
    print("  CUSTOMER CHURN INTELLIGENCE - ENTERPRISE ML PLATFORM")
    print("=" * 70)
    print("Starting FastAPI backend server on http://127.0.0.1:8000 ...")
    
    # Ensure backend path is in sys.path
    backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "backend"))
    sys.path.insert(0, backend_path)
    
    # Auto-open browser after 1 second
    try:
        webbrowser.open("http://127.0.0.1:8000")
    except Exception as e:
        print("Could not auto-open browser:", e)
        
    # Run uvicorn server
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)

if __name__ == "__main__":
    main()
