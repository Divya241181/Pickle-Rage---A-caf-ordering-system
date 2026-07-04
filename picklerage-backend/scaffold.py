import os

base_dir = r'd:\Projects\Pickel Rage\picklerage-backend'

folders = [
    'models',
    'routers',
    'schemas',
    'services'
]

for folder in folders:
    os.makedirs(os.path.join(base_dir, folder), exist_ok=True)

# Create __init__.py
for folder in folders:
    with open(os.path.join(base_dir, folder, '__init__.py'), 'w') as f:
        pass

# requirements.txt
with open(os.path.join(base_dir, 'requirements.txt'), 'w') as f:
    f.write('fastapi\nuvicorn\nsupabase\npython-dotenv\npydantic\n')

# .env.example
with open(os.path.join(base_dir, '.env.example'), 'w') as f:
    f.write('SUPABASE_URL=your_supabase_url\nSUPABASE_ANON_KEY=your_supabase_anon_key\n')

# .env
with open(os.path.join(base_dir, '.env'), 'w') as f:
    f.write('SUPABASE_URL=http://localhost:8000\nSUPABASE_ANON_KEY=dummy\n')

# config.py
with open(os.path.join(base_dir, 'config.py'), 'w') as f:
    f.write('''import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY', '')
''')

# database.py
with open(os.path.join(base_dir, 'database.py'), 'w') as f:
    f.write('''from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_ANON_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
''')

# main.py
with open(os.path.join(base_dir, 'main.py'), 'w') as f:
    f.write('''from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import menu, tables, sessions, orders, kitchen, billing, waiter

app = FastAPI(title=\"Picklerage QR Ordering API\")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[\"*\"],
    allow_credentials=True,
    allow_methods=[\"*\"],
    allow_headers=[\"*\"],
)

app.include_router(menu.router, prefix=\"/api/menu\", tags=[\"Menu\"])
app.include_router(tables.router, prefix=\"/api/tables\", tags=[\"Tables\"])
app.include_router(sessions.router, prefix=\"/api/sessions\", tags=[\"Sessions\"])
app.include_router(orders.router, prefix=\"/api/orders\", tags=[\"Orders\"])
app.include_router(kitchen.router, prefix=\"/api/kitchen\", tags=[\"Kitchen\"])
app.include_router(billing.router, prefix=\"/api/billing\", tags=[\"Billing\"])
app.include_router(waiter.router, prefix=\"/api/waiter\", tags=[\"Waiter\"])

@app.get(\"/\")
def read_root():
    return {\"status\": \"ok\", \"message\": \"Picklerage API is running\"}
''')

# routers
routers_list = ['menu', 'tables', 'sessions', 'orders', 'kitchen', 'billing', 'waiter']
for r in routers_list:
    with open(os.path.join(base_dir, 'routers', f'{r}.py'), 'w') as f:
        f.write(f'''from fastapi import APIRouter

router = APIRouter()

@router.get(\"/\")
def get_{r}():
    return {{\"message\": \"{r} route working\"}}
''')

# models
models_list = ['table', 'category', 'menu_item', 'session', 'order', 'payment']
for m in models_list:
    with open(os.path.join(base_dir, 'models', f'{m}.py'), 'w') as f:
        f.write('# Placeholder for models\\n')

# schemas
schemas_list = ['menu', 'table', 'session', 'order', 'payment']
for s in schemas_list:
    with open(os.path.join(base_dir, 'schemas', f'{s}.py'), 'w') as f:
        f.write('from pydantic import BaseModel\\n\\n# Placeholder schema\\n')

# services
with open(os.path.join(base_dir, 'services', 'supabase_client.py'), 'w') as f:
    f.write('# Placeholder for specific supabase operations\\n')

print('Scaffolding complete.')
