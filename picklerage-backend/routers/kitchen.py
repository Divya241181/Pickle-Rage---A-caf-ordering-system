from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_kitchen():
    return {"message": "kitchen route working"}
