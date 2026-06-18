from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Dict, Any, Optional
from ..auth import get_current_user_email
from ..services.gemini_service import gemini_service
import logging

router = APIRouter(prefix="/api/assistant", tags=["Assistant"])
logger = logging.getLogger(__name__)

# Page Descriptions in Hindi for Dynamic Guidance
PAGE_GUIDES = {
    "/": "यह होम पेज है। यहाँ आप करियर सेतु की सुविधाओं के बारे में जान सकते हैं और अपनी पसंद की भूमिका चुन सकते हैं। प्रोफेशनल, वर्कर या कस्टमर के रूप में जुड़ें।",
    "/dashboard": "यह आपका मुख्य डैशबोर्ड है। यहाँ आप अपनी प्रोग्रेस, जॉब रेकमेंडेशन्स और करियर स्कोर देख सकते हैं। अपनी स्किल्स बढ़ाने के लिए सुझाव भी यहीं मिलेंगे।",
    "/profile": "यह आपका प्रोफाइल पेज है। यहाँ आप अपनी शिक्षा, अनुभव, स्किल्स और सोशल मीडिया लिंक्स को अपडेट कर सकते हैं। अपनी जानकारी सही रखें ताकि बेहतर जॉब मिल सके।",
    "/jobs": "यहाँ आप अपनी स्किल्स के आधार पर ताज़ा नौकरियाँ ढूँढ सकते हैं। आप लोकेशन के हिसाब से भी फ़िल्टर कर सकते हैं और सीधे अप्लाई कर सकते हैं।",
    "/skills": "इस पेज पर आप अपनी स्किल्स का विश्लेषण कर सकते हैं। हमारा एआई आपको बताएगा कि आपकी पसंद की जॉब के लिए आपको और क्या सीखने की ज़रूरत है।",
    "/roadmap": "यह आपका लर्निंग रोडमैप है। यहाँ आपको अगले 30, 60 और 90 दिनों का एक सटीक प्लान मिलेगा जिससे आप नई स्किल्स में मास्टर बन सकें।",
    "/resume": "यहाँ आप अपना रेज़्यूमे अपलोड कर सकते हैं। हमारा एआई आपके रेज़्यूमे को स्कोर करेगा और उसे बेहतर बनाने के सुझाव देगा।",
    "/interview": "यह इंटरव्यू प्रैक्टिस सेक्शन है। यहाँ आप एआई के साथ मॉक इंटरव्यू दे सकते हैं और अपनी बोलने की क्षमता और जवाबों पर फीडबैक पा सकते हैं।",
    "/analytics": "यहाँ आप पूरे देश के जॉब मार्किट और ट्रेंड्स को देख सकते हैं। कौन सी स्किल्स डिमांड में हैं और कहाँ सबसे ज़्यादा मौके हैं, यह सब यहाँ दिखेगा।",
    "/chat": "यह आपका मैसेजिंग सेंटर है। यहाँ आप अन्य प्रोफेशनल्स और कस्टमर्स से सीधे बात कर सकते हैं।",
    "/login": "यहाँ आप अपना मोबाइल नंबर और पासवर्ड डालकर अपने अकाउंट में लॉगिन कर सकते हैं।",
    "/register": "नया अकाउंट बनाने के लिए यहाँ अपनी सामान्य जानकारी जैसे नाम, मोबाइल नंबर और पेशा चुनें।",
}

@router.post("/query")
async def process_assistant_query(
    data: Dict[str, Any] = Body(...),
    email: str = Depends(get_current_user_email)
):
    """
    Processes a voice query from the user. 
    Detects if it's a page explanation request or a general query.
    """
    # Intent Detection
    transcript = data.get("transcript", "").lower()
    pathname = data.get("pathname", "/")
    
    # 1. Profile Intent
    if any(kw in transcript for kw in ["प्रोफाइल", "profile", "मेरी जानकारी", "my information"]):
        return {
            "intent": "action",
            "action": "navigate",
            "url": "/profile",
            "response": "ज़रूर! मैं आपको प्रोफाइल पेज पर ले जा रहा हूँ।",
            "success": True
        }
        
    # 2. Request/Service Intent
    if any(kw in transcript for kw in ["रिक्वेस्ट", "request", "मेरा काम", "my work"]):
        return {
            "intent": "action",
            "action": "navigate",
            "url": "/dashboard",
            "response": "ज़रूर! यहाँ आपके सभी रिक्वेस्ट और उनके स्टेटस की जानकारी है।",
            "success": True
        }

    # PRIORITY LOGIC: 
    # 1. Detect if it's a question (General Query)
    # 2. If not a question, explain the page (Guidance)
    
    question_keywords = [
        "what", "how", "why", "when", "where", "can", "is", "do", "tell",
        "क्या", "कैसे", "क्यों", "कब", "कहाँ", "बताओ", "मदद"
    ]
    
    is_question = any(kw in transcript for kw in question_keywords) or transcript.endswith("?")
    
    if not is_question and pathname in PAGE_GUIDES:
        # Fallback to page description if no question is detected
        response_text = f"ज़रूर! {PAGE_GUIDES[pathname]}"
        return {
            "intent": "guidance",
            "response": response_text,
            "success": True
        }
    
    # General AI Query via Gemini
    prompt = f"""
    The user is asking a career-related or general question through a voice assistant.
    User's Question: {transcript}
    Current Page User is on: {pathname}
    
    Instructions:
    - Respond in Hindi (Devanagari script) primarily.
    - Be brief, helpful, and professional.
    - Keep the answer under 2-3 sentences for voice assistants.
    - If it's a greeting, reply warmly.
    - If it's a complex task, suggest visiting the relevant section like /jobs or /skills.
    """
    
    try:
        ai_response = await gemini_service.generate_ai_response(prompt)
        if not ai_response:
            ai_response = "क्षमा करें, मैं अभी जानकारी प्राप्त नहीं कर पा रहा हूँ। कृपया बाद में प्रयास करें।"
            
        return {
            "intent": "general",
            "response": ai_response.strip(),
            "success": True
        }
    except Exception as e:
        logger.error(f"Assistant Query Error: {e}")
        return {
            "intent": "error",
            "response": "क्षमा करें, सर्वर में कुछ समस्या आ रही है।",
            "success": False
        }
