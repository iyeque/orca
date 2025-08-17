import random

def suggest_suppliers(product_ids: list, inventory: list):
    """
    Suggests suppliers based on the products they supply from the inventory.
    For a more advanced model, this would involve historical performance, pricing, etc.
    """
    eligible_suppliers = set()
    for product_id in product_ids:
        for item in inventory:
            if item.get("product_id") == product_id:
                eligible_suppliers.add(item.get("supplier_id"))
    
    # If no specific suppliers found, return all unique suppliers from inventory
    if not eligible_suppliers:
        all_suppliers = set(item.get("supplier_id") for item in inventory if item.get("supplier_id"))
        return list(all_suppliers)

    return list(eligible_suppliers)
