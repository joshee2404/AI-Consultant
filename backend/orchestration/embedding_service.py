import logging
from services.bedrock_client import invoke_titan_embed, cosine_similarity

logger = logging.getLogger(__name__)

# 5 AI Category descriptions for pre-embedding
AI_CATEGORIES = {
    "NLP/Text Processing": "Natural language processing, text analysis, sentiment analysis, text classification, named entity recognition, language translation, summarization",
    "Computer Vision": "Image recognition, object detection, visual inspection, facial recognition, OCR, image classification, video analysis",
    "Predictive Analytics": "Machine learning forecasting, demand prediction, churn prediction, risk scoring, time-series analysis, regression models",
    "Process Automation": "Robotic process automation, workflow automation, rule-based automation, intelligent document processing, decision automation",
    "Recommendation Systems": "Personalization, content recommendations, product suggestions, collaborative filtering, user behavior analysis",
    "Anomaly Detection": "Fraud detection, outlier detection, quality control, monitoring, alert systems, pattern deviation",
    "Document Intelligence": "Document extraction, form processing, contract analysis, invoice processing, PDF parsing",
    "Conversational AI": "Chatbots, virtual assistants, voice interfaces, customer service automation, FAQ automation",
}

# Cache category embeddings (computed once at startup)
_category_embeddings: dict[str, list[float]] = {}


def get_category_embeddings() -> dict[str, list[float]]:
    """Pre-embed all AI categories using Titan. Called once at startup."""
    global _category_embeddings
    if not _category_embeddings:
        logger.info("[Stage 2] Pre-computing category embeddings...")
        for category, description in AI_CATEGORIES.items():
            try:
                _category_embeddings[category] = invoke_titan_embed(description)
                logger.info(f"[Stage 2] Embedded category: {category}")
            except Exception as e:
                logger.error(f"[Stage 2] Failed to embed {category}: {e}")
    return _category_embeddings


def validate_opportunities(opportunities: list[dict]) -> list[dict]:
    """
    Stage 2: Use Titan embeddings to validate and potentially correct
    Claude's use case category mapping via cosine similarity.
    """
    logger.info(f"[Stage 2] Validating {len(opportunities)} opportunities with Titan")
    
    category_embeddings = get_category_embeddings()
    
    validated = []
    for opp in opportunities:
        process_text = f"{opp['process_name']}: {opp.get('rationale', '')} {opp.get('business_impact', '')}"
        
        try:
            process_embedding = invoke_titan_embed(process_text)
            
            # Compute similarity to all categories
            similarities = {}
            for category, cat_embedding in category_embeddings.items():
                similarities[category] = cosine_similarity(process_embedding, cat_embedding)
            
            # Best matching category
            best_category = max(similarities, key=similarities.get)
            best_score = similarities[best_category]
            
            # Validate or correct Claude's classification
            claude_category = opp.get("use_case_category", "")
            claude_score = similarities.get(claude_category, 0)
            
            validated_category = claude_category
            if best_score > claude_score + 0.05:  # Titan disagrees significantly
                logger.info(
                    f"[Stage 2] Correcting '{opp['process_name']}': "
                    f"{claude_category} ({claude_score:.3f}) → {best_category} ({best_score:.3f})"
                )
                validated_category = best_category
            
            opp["similarity_score"] = round(best_score, 4)
            opp["validated_category"] = validated_category
            opp["all_similarities"] = {k: round(v, 4) for k, v in similarities.items()}
            
        except Exception as e:
            logger.error(f"[Stage 2] Embedding failed for {opp['process_name']}: {e}")
            opp["similarity_score"] = None
            opp["validated_category"] = opp.get("use_case_category")
        
        validated.append(opp)
    
    logger.info("[Stage 2] Validation complete")
    return validated
