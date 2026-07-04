import os, re

base_dir = r'd:\Projects\Pickel Rage\frontend-static'
out_dir = r'd:\Projects\Pickel Rage\frontend\src\pages'

def html_to_jsx(html):
    html = re.sub(r'<script.*?</script>', '', html, flags=re.DOTALL)
    body_match = re.search(r'<body.*?>(.*?)</body>', html, flags=re.DOTALL)
    if not body_match: return ""
    content = body_match.group(1).strip()
    content = content.replace('class="', 'className="')
    content = content.replace("class='", "className='")
    void_elements = ['input', 'img', 'br', 'hr', 'source', 'link', 'meta']
    for tag in void_elements:
        pattern = re.compile(r'(<'+tag+r'\b[^>]*?)(?<!/)>', flags=re.IGNORECASE)
        content = pattern.sub(r'\1 />', content)
        
    # Manual precise style replacements
    content = content.replace('style="font-variation-settings: \'FILL\' 1;"', "style={{ fontVariationSettings: \"'FILL' 1\" }}")
    content = content.replace("style='font-variation-settings: \"FILL\" 1;'", "style={{ fontVariationSettings: \"'FILL' 1\" }}")
    
    content = re.sub(r'style="width:\s*(.*?)%"', r'style={{ width: "\1%" }}', content)
    content = re.sub(r'style="height:\s*(.*?)%"', r'style={{ height: "\1%" }}', content)
    content = re.sub(r'style="background-image:\s*url\([\'"]?(.*?)[\'"]?\)"', r'style={{ backgroundImage: `url("\1")` }}', content)
    content = re.sub(r"style='background-image:\s*url\([\'\"]?(.*?)[\'\"]?\)'", r'style={{ backgroundImage: `url("\1")` }}', content)

    content = content.replace('<!--', '{/*').replace('-->', '*/}')
    
    content = content.replace('stroke-width', 'strokeWidth')
    content = content.replace('stroke-linecap', 'strokeLinecap')
    content = content.replace('stroke-linejoin', 'strokeLinejoin')
    content = content.replace('fill-rule', 'fillRule')
    content = content.replace('clip-rule', 'clipRule')
    content = content.replace('viewbox', 'viewBox')
    
    content = content.replace('type="text">', 'type="text" />')
    content = content.replace('type="tel">', 'type="tel" />')
    
    return content

files = {
    'index.html': 'CustomerMenu.jsx',
    'kitchen-dashboard.html': 'KitchenDashboard.jsx',
    'billing-dashboard.html': 'BillingDashboard.jsx',
    'order-tracker.html': 'OrderTracker.jsx',
    'checkout.html': 'Checkout.jsx'
}

for html_file, jsx_file in files.items():
    with open(os.path.join(base_dir, html_file), 'r', encoding='utf-8') as f:
        content = html_to_jsx(f.read())
        name = jsx_file.replace('.jsx', '')
        full_code = f'import React, {{ useState, useEffect, useContext }} from "react";\nimport {{ useNavigate, useSearchParams, useParams }} from "react-router-dom";\nimport {{ CartContext }} from "../context/CartContext";\nimport * as api from "../services/api";\nimport {{ supabase }} from "../services/supabase";\n\nexport default function {name}() {{\n  return (\n    <>\n{content}\n    </>\n  );\n}}'
        with open(os.path.join(out_dir, jsx_file), 'w', encoding='utf-8') as out:
            out.write(full_code)
print("Conversion successful.")
