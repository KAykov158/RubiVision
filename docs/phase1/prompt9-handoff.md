# Prompt 9: Analyze, Challenges, and Settings handoff

Analyze, Challenges, and Settings are route shells built on the existing shared tokens, primitives, localization catalog, route states, theme provider, and app services context. Analyze does not request camera permission, inspect devices, open local files, upload media, or call the analysis service. Its loading, empty, error, denied, and unsupported displays are presentation states available for future service integration; the live page is explicitly unavailable and shows no classifications. The copy states that movement/pause labels do not establish exact cube moves, cube states, or CFOP phases.

Challenges has no challenge catalog or participation contract. It shows an empty discovery slot and unavailable participation, with its join control disabled. It displays no fake challenges, attempts, participants, scores, or rankings.

Settings retains the existing ThemeSettings control and its preferences-service boundary. With no injected service, theme changes are session-only. Auth, locale selection, privacy actions, and other application preferences are labeled unavailable/not persisted. Reduced motion follows the browser/OS preference. No browser persistence or new database/service contracts were introduced.
