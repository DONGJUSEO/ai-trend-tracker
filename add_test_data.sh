#!/bin/bash

echo "🚀 테스트 데이터 추가 시작..."
echo ""

# FLUX.1 Dev
echo "추가 중: FLUX.1 Dev..."
curl -s -X POST http://localhost:8000/api/v1/huggingface/ \
  -H "Content-Type: application/json" \
  -d '{"model_id":"black-forest-labs/FLUX.1-dev","model_name":"FLUX.1 Dev","author":"black-forest-labs","description":"최첨단 이미지 생성 모델","task":"text-to-image","tags":["diffusion","image-generation"],"library_name":"diffusers","downloads":2800000,"likes":8950,"url":"https://huggingface.co/black-forest-labs/FLUX.1-dev"}' > /dev/null
echo "✅ FLUX.1 Dev 추가 완료"

# Whisper Large V3
echo "추가 중: Whisper Large V3..."
curl -s -X POST http://localhost:8000/api/v1/huggingface/ \
  -H "Content-Type: application/json" \
  -d '{"model_id":"openai/whisper-large-v3","model_name":"Whisper Large V3","author":"openai","description":"OpenAI의 최신 음성 인식 모델","task":"automatic-speech-recognition","tags":["whisper","audio","asr"],"library_name":"transformers","downloads":5200000,"likes":12300,"url":"https://huggingface.co/openai/whisper-large-v3"}' > /dev/null
echo "✅ Whisper Large V3 추가 완료"

# Qwen 2.5
echo "추가 중: Qwen 2.5 72B..."
curl -s -X POST http://localhost:8000/api/v1/huggingface/ \
  -H "Content-Type: application/json" \
  -d '{"model_id":"Qwen/Qwen2.5-72B-Instruct","model_name":"Qwen 2.5 72B Instruct","author":"Qwen","description":"Alibaba의 강력한 다국어 LLM","task":"text-generation","tags":["qwen","multilingual"],"library_name":"transformers","downloads":980000,"likes":3420,"url":"https://huggingface.co/Qwen/Qwen2.5-72B-Instruct"}' > /dev/null
echo "✅ Qwen 2.5 72B 추가 완료"

# Stable Diffusion
echo "추가 중: Stable Diffusion v1.5..."
curl -s -X POST http://localhost:8000/api/v1/huggingface/ \
  -H "Content-Type: application/json" \
  -d '{"model_id":"runwayml/stable-diffusion-v1-5","model_name":"Stable Diffusion v1.5","author":"runwayml","description":"가장 인기 있는 이미지 생성 모델","task":"text-to-image","tags":["stable-diffusion","image-generation"],"library_name":"diffusers","downloads":15600000,"likes":25800,"url":"https://huggingface.co/runwayml/stable-diffusion-v1-5"}' > /dev/null
echo "✅ Stable Diffusion v1.5 추가 완료"

# Mixtral
echo "추가 중: Mixtral 8x7B..."
curl -s -X POST http://localhost:8000/api/v1/huggingface/ \
  -H "Content-Type: application/json" \
  -d '{"model_id":"mistralai/Mixtral-8x7B-Instruct-v0.1","model_name":"Mixtral 8x7B Instruct","author":"mistralai","description":"Mixture of Experts 아키텍처의 강력한 LLM","task":"text-generation","tags":["mixtral","moe","instruct"],"library_name":"transformers","downloads":3200000,"likes":9100,"url":"https://huggingface.co/mistralai/Mixtral-8x7B-Instruct-v0.1"}' > /dev/null
echo "✅ Mixtral 8x7B 추가 완료"

echo ""
echo "📊 현재 저장된 모델 목록:"
curl -s http://localhost:8000/api/v1/huggingface/ | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"총 {data['total']}개 모델\"); [print(f\"  - {m['model_name']} (👍 {m['likes']:,})\") for m in data['items']]"

echo ""
echo "✨ 완료!"
