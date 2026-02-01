"""YouTube 채널 시드 데이터 삽입 스크립트"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.youtube_channel import YouTubeChannel
from app.seeds.youtube_channels import ALL_CHANNELS
from app.services.youtube_service import YouTubeService


async def seed_youtube_channels():
    """YouTube 채널 시드 데이터 삽입"""
    async with AsyncSessionLocal() as db:
        youtube_service = YouTubeService()
        inserted_count = 0
        updated_count = 0

        for channel_data in ALL_CHANNELS:
            try:
                # 이미 존재하는지 확인
                result = await db.execute(
                    select(YouTubeChannel).where(
                        YouTubeChannel.channel_id == channel_data["channel_id"]
                    )
                )
                existing_channel = result.scalar_one_or_none()

                # YouTube API에서 채널 정보 가져오기 (구독자 수, 영상 수 등)
                channel_info = await youtube_service.get_channel_info(
                    channel_data["channel_id"]
                )

                if existing_channel:
                    # 기존 채널 업데이트
                    if channel_info:
                        existing_channel.subscriber_count = channel_info.get(
                            "subscriber_count", 0
                        )
                        existing_channel.video_count = channel_info.get("video_count", 0)
                    print(
                        f"✅ 채널 업데이트: {channel_data['channel_name']} ({channel_data['channel_id']})"
                    )
                    updated_count += 1
                else:
                    # 새 채널 추가
                    new_channel = YouTubeChannel(
                        channel_id=channel_data["channel_id"],
                        channel_name=channel_data["channel_name"],
                        channel_handle=channel_data.get("channel_handle"),
                        description=channel_data.get("description"),
                        category=channel_data.get("category", "AI/ML"),
                        priority=channel_data.get("priority", 0),
                        subscriber_count=channel_info.get("subscriber_count", 0)
                        if channel_info
                        else 0,
                        video_count=channel_info.get("video_count", 0)
                        if channel_info
                        else 0,
                        is_active=True,
                    )
                    db.add(new_channel)
                    print(
                        f"✅ 새 채널 추가: {channel_data['channel_name']} ({channel_data['channel_id']})"
                    )
                    inserted_count += 1

                await db.commit()

            except Exception as e:
                await db.rollback()
                print(
                    f"❌ 채널 처리 실패 ({channel_data['channel_name']}): {e}"
                )

        print(f"\n🎉 시드 완료: {inserted_count}개 추가, {updated_count}개 업데이트")


if __name__ == "__main__":
    print("📺 YouTube 채널 시드 데이터 삽입 시작...\n")
    asyncio.run(seed_youtube_channels())
