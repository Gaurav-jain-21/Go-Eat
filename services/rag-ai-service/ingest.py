from config import (
    foods_col,
    hotels_col,
    knowledge_collection,
    embedding_model,
)


def food_to_text(food: dict, hotel_name: str) -> str:
    text  = f"Restaurant: {hotel_name}\n"
    text += f"Food Item: {food.get('name', '')}\n"
    text += f"Description: {food.get('description', 'No description')}\n"
    text += f"Price: Rs.{food.get('price', 0)}\n"
    text += f"Category: {food.get('category', 'General')}\n"
    text += f"Vegetarian: {'Yes' if food.get('isVeg') else 'No'}\n"
    text += f"Available: {'Yes' if food.get('isAvailable', True) else 'No'}\n"
    return text


def hotel_to_text(hotel: dict) -> str:
    address = hotel.get("address", {})
    text  = f"Restaurant Name: {hotel.get('name', '')}\n"
    text += f"Description: {hotel.get('description', 'No description')}\n"
    text += f"City: {address.get('city', '')}\n"
    text += f"Phone: {hotel.get('phone', 'Not available')}\n"
    text += f"Open: {'Yes' if hotel.get('isOpen', True) else 'No'}\n"
    text += f"Rating: {hotel.get('rating', 0)}/5\n"
    return text


FAQS = [
    {"id": "faq_1",  "text": "Question: What is the delivery radius?\nAnswer: Go-Eat delivers within 10 km of the restaurant."},
    {"id": "faq_2",  "text": "Question: How do I cancel my order?\nAnswer: Cancel from My Orders when status is Placed or Confirmed. Once Preparing, cancellation is not possible."},
    {"id": "faq_3",  "text": "Question: How long does a refund take?\nAnswer: Refunds take 5-7 working days to your original payment method."},
    {"id": "faq_4",  "text": "Question: What payment methods are accepted?\nAnswer: Go-Eat accepts Razorpay (UPI, cards, netbanking) and PayPal."},
    {"id": "faq_5",  "text": "Question: How do I track my order?\nAnswer: Go to My Orders to see: Placed, Confirmed, Preparing, Out for Delivery, Delivered."},
    {"id": "faq_6",  "text": "Question: Can I order from multiple restaurants?\nAnswer: Yes! Add items from multiple restaurants in one cart and place a single order."},
    {"id": "faq_7",  "text": "Question: How do restaurants register on Go-Eat?\nAnswer: Register through Hotel panel. Admin approval required before receiving orders."},
    {"id": "faq_8",  "text": "Question: Is there a minimum order amount?\nAnswer: No minimum order amount on Go-Eat."},
    {"id": "faq_9",  "text": "Question: How do I contact support?\nAnswer: Reach Go-Eat support through the Help section in the app or email support@goeat.com."},
    {"id": "faq_10", "text": "Question: Are there delivery charges?\nAnswer: Delivery charges may vary depending on the restaurant and your distance from it."},
]


async def ingest_all_data(force: bool = False):
    print("\nStarting data ingestion into ChromaDB...")

    if force:
        existing = knowledge_collection.get()
        if existing["ids"]:
            knowledge_collection.delete(ids=existing["ids"])
            print(f"Cleared {len(existing['ids'])} existing vectors")

    count = knowledge_collection.count()
    if count > 0 and not force:
        print(f"Already have {count} vectors. Use force_reingest=true to rebuild.")
        return {"message": f"Already ingested {count} documents"}

    all_ids       = []
    all_documents = []
    all_metadatas = []

    # hotels
    print("Processing hotels...")
    hotel_count = 0
    async for hotel in hotels_col.find({"isApproved": True}):
        all_ids.append(f"hotel_{str(hotel['_id'])}")
        all_documents.append(hotel_to_text(hotel))
        all_metadatas.append({
            "type":       "hotel",
            "hotel_name": hotel.get("name", ""),
            "source_id":  str(hotel["_id"]),
        })
        hotel_count += 1
        print(f"  Hotel: {hotel.get('name')}")

    # foods
    print("Processing food items...")
    food_count = 0
    async for food in foods_col.find({}):
        hotel      = await hotels_col.find_one({"_id": food.get("hotel")})
        hotel_name = hotel.get("name", "Unknown") if hotel else "Unknown"
        all_ids.append(f"food_{str(food['_id'])}")
        all_documents.append(food_to_text(food, hotel_name))
        all_metadatas.append({
            "type":       "food",
            "hotel_name": hotel_name,
            "food_name":  food.get("name", ""),
            "source_id":  str(food["_id"]),
        })
        food_count += 1
        print(f"  Food: {food.get('name')} @ {hotel_name}")

    # faqs
    print("Processing FAQs...")
    for faq in FAQS:
        all_ids.append(faq["id"])
        all_documents.append(faq["text"])
        all_metadatas.append({"type": "faq"})

    total = len(all_ids)
    print(f"\nGenerating embeddings for {total} documents...")

    all_embeddings = embedding_model.encode(
        all_documents,
        show_progress_bar=True,
        batch_size=32,
    ).tolist()

    print("Storing in ChromaDB...")
    knowledge_collection.upsert(
        ids=all_ids,
        embeddings=all_embeddings,
        documents=all_documents,
        metadatas=all_metadatas,
    )

    print(f"\nIngestion complete! Hotels={hotel_count} Foods={food_count} FAQs={len(FAQS)}")
    return {
        "message":    f"Ingested {total} documents",
        "hotels":     hotel_count,
        "food_items": food_count,
        "faqs":       len(FAQS),
    }