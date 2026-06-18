import logging
from typing import List, Dict, Any, Optional
from fastapi import Header, HTTPException, Depends
from .database import get_db, client as mongo_client
from .auth import get_current_user_email
import os
import csv

logger = logging.getLogger(__name__)

# Centralized DB Dependency
async def get_db_async():
    return get_db()

# Centralized Models Injection
def get_roles_db() -> List[Any]:
    """
    Centralized roles loader for all routers.
    """
    from .models import JobRole
    roles = []
    data_path = os.path.join(os.path.dirname(__file__), "../data/skills_roles_dataset.csv")
    try:
        with open(data_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            seen = set()
            for idx, row in enumerate(reader, start=1):
                title = row["Role"]
                if title not in seen:
                    roles.append(JobRole(
                        id=str(idx),
                        title=title,
                        category=row["Category"],
                        requiredSkills=[s.strip() for s in row["Skills"].split(",")],
                        avgSalary=row["AverageSalary"],
                        demandLevel=row["DemandLevel"],
                        growth="High",
                        description=f"Professional {title} role in the {row['Category']} sector."
                    ))
                    seen.add(title)
    except Exception as e:
        logger.warning(f"Could not load global roles dataset: {e}")
    return roles

# Global instances for reuse
ROLES_DB = get_roles_db()
