"""
FastAPI server for Danish Rent Roll Parser.

Provides REST API endpoints for parsing rent roll files.
"""

import os
import tempfile
from typing import Union

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from parser import parse_rent_roll, ParseError

app = FastAPI(
    title="Danish Rent Roll Parser",
    description="API for parsing Danish rent roll files (Excel and PDF)",
    version="1.0.0",
)

# CORS configuration - allow requests from Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "rent-roll-parser"}


@app.post("/parse", response_model=None)
async def parse_file(file: UploadFile = File(...)):
    """
    Parse an uploaded rent roll file.

    Accepts Excel (.xlsx, .xls) or PDF files.
    Returns structured rent roll data in JSON format.
    """
    # Validate file extension
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".xlsx", ".xls", ".pdf"]:
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": "invalid_file_type",
                "message": "Invalid file type. Supported: .xlsx, .xls, .pdf",
            },
        )

    # Save uploaded file to temporary location
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {str(e)}")

    try:
        # Parse the file
        result = parse_rent_roll(tmp_path)
        return {"success": True, **result}

    except ParseError as e:
        return JSONResponse(
            status_code=400,
            content=e.to_dict(),
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "internal_error",
                "message": f"Unexpected error: {str(e)}",
            },
        )

    finally:
        # Clean up temporary file
        try:
            os.unlink(tmp_path)
        except Exception:
            pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
