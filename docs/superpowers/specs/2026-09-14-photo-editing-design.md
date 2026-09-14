# 감성사진관 편집 고도화 설계

편집 화면은 사진 스트립을 중심에 고정하고 하단 `사진·필터·프레임` 탭으로 도구만 전환한다. 사진별 transform은 `scale`, `offsetX`, `offsetY`로 저장하며, CSS와 Canvas가 동일한 cover crop 계산을 사용한다. 필터는 전체 스트립 공통이며 CSS `filter`와 Canvas `context.filter`에 동일한 문자열을 제공한다.

프레임은 데이터 프리셋으로 footer, 날짜, 라벨을 정의한다. 사진 선택, 촬영, 다운로드 흐름은 유지한다. 캡처 취소는 token ref를 매 초·캡처 직후 확인해 취소 후 `done`이 실행되지 않게 한다.
