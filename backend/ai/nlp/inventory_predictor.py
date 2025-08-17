def predict_runout(quantity: int, daily_consumption_rate: float) -> dict:
    """
    Predicts when the inventory will run out based on current quantity and consumption rate.
    
    Args:
        quantity: Current quantity in stock
        daily_consumption_rate: Average daily consumption rate
        
    Returns:
        dict: Prediction results including days until runout and predicted runout date
    """
    if not daily_consumption_rate:
        return {
            "days_until_runout": None,
            "predicted_runout_date": None,
            "status": "Cannot predict - no consumption rate data"
        }
        
    days_until_runout = quantity / daily_consumption_rate
    
    import datetime
    runout_date = datetime.datetime.now() + datetime.timedelta(days=days_until_runout)
    
    return {
        "days_until_runout": round(days_until_runout, 1),
        "predicted_runout_date": runout_date.isoformat(),
        "status": "OK"
    }
