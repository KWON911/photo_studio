# 감성사진관 편집 고도화 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 사진별 crop 편집, 감성 필터, 8개 프레임과 날짜 옵션을 제공한다.

**Architecture:** 공통 crop 계산과 filter 프리셋을 CSS 미리보기·Canvas export가 함께 사용한다.

**Tech Stack:** React, TypeScript, Canvas API, Pointer Events.

### Task 1: 데이터와 순수 계산
- [ ] 프레임 8개, 필터 6개, cover crop transform 테스트를 작성한다.
- [ ] 타입·프리셋·공통 렌더링 계산을 구현한다.

### Task 2: 편집 UI
- [ ] PhotoStrip, PhotoEditor, FilterSelector를 추가한다.
- [ ] pointer drag, pinch, wheel, reset과 날짜 옵션을 연결한다.

### Task 3: 합성과 취소
- [ ] Canvas 합성에 transform/filter/frame footer를 반영한다.
- [ ] 캡처 취소 token으로 늦은 done 호출을 차단한다.

### Task 4: 검증
- [ ] 테스트, lint, production build를 실행한다.
