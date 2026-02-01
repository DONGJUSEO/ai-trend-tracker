#!/usr/bin/env python3
"""테스트 데이터 추가 스크립트"""
import httpx
import asyncio

BASE_URL = "http://localhost:8000/api/v1/huggingface/"

# 테스트 데이터
test_models = [
    {
        "model_id": "black-forest-labs/FLUX.1-dev",
        "model_name": "FLUX.1 Dev",
        "author": "black-forest-labs",
        "description": "최첨단 이미지 생성 모델. Stable Diffusion을 뛰어넘는 성능",
        "task": "text-to-image",
        "tags": ["diffusion", "image-generation", "flux"],
        "library_name": "diffusers",
        "downloads": 2800000,
        "likes": 8950,
        "url": "https://huggingface.co/black-forest-labs/FLUX.1-dev"
    },
    {
        "model_id": "openai/whisper-large-v3",
        "model_name": "Whisper Large V3",
        "author": "openai",
        "description": "OpenAI의 최신 음성 인식 모델. 다국어 지원",
        "task": "automatic-speech-recognition",
        "tags": ["whisper", "audio", "asr"],
        "library_name": "transformers",
        "downloads": 5200000,
        "likes": 12300,
        "url": "https://huggingface.co/openai/whisper-large-v3"
    },
    {
        "model_id": "Qwen/Qwen2.5-72B-Instruct",
        "model_name": "Qwen 2.5 72B Instruct",
        "author": "Qwen",
        "description": "Alibaba의 강력한 다국어 LLM. 한국어 지원 우수",
        "task": "text-generation",
        "tags": ["qwen", "multilingual", "conversational"],
        "library_name": "transformers",
        "downloads": 980000,
        "likes": 3420,
        "url": "https://huggingface.co/Qwen/Qwen2.5-72B-Instruct"
    },
    {
        "model_id": "runwayml/stable-diffusion-v1-5",
        "model_name": "Stable Diffusion v1.5",
        "author": "runwayml",
        "description": "가장 인기 있는 이미지 생성 모델",
        "task": "text-to-image",
        "tags": ["stable-diffusion", "image-generation"],
        "library_name": "diffusers",
        "downloads": 15600000,
        "likes": 25800,
        "url": "https://huggingface.co/runwayml/stable-diffusion-v1-5"
    },
    {
        "model_id": "mistralai/Mixtral-8x7B-Instruct-v0.1",
        "model_name": "Mixtral 8x7B Instruct",
        "author": "mistralai",
        "description": "Mixture of Experts 아키텍처의 강력한 LLM",
        "task": "text-generation",
        "tags": ["mixtral", "moe", "instruct"],
        "library_name": "transformers",
        "downloads": 3200000,
        "likes": 9100,
        "url": "https://huggingface.co/mistralai/Mixtral-8x7B-Instruct-v0.1"
    }
]


async def add_models():
    """모델 데이터 추가"""
    async with httpx.AsyncClient() as client:
        for model in test_models:
            try:
                response = await client.post(BASE_URL, json=model)
                if response.status_code == 201:
                    data = response.json()
                    print(f"✅ 추가 성공: {data['model_name']} (ID: {data['id']})")
                elif response.status_code == 400:
                    print(f"⚠️  이미 존재: {model['model_name']}")
                else:
                    print(f"❌ 실패: {model['model_name']} - {response.status_code}")
            except Exception as e:
                print(f"❌ 에러: {model['model_name']} - {e}")


async def get_models():
    """모델 목록 조회"""
    async with httpx.AsyncClient() as client:
        response = await client.get(BASE_URL)
        data = response.json()
        print(f"\n📊 총 {data['total']}개 모델")
        for item in data['items']:
            print(f"  - {item['model_name']} (👍 {item['likes']:,})")


async def main():
    print("🚀 테스트 데이터 추가 시작...\n")
    await add_models()
    await get_models()
    print("\n✨ 완료!")


if __name__ == "__main__":
    asyncio.run(main())
