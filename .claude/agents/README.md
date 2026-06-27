# Agentes

Subagentes especializados del proyecto. Un archivo `.md` por agente.

Cada archivo lleva frontmatter:

```markdown
---
name: nombre-del-agente
description: cuándo usar este agente (lo lee el orquestador para decidir)
tools: Read, Edit, Bash   # opcional; por defecto hereda todas
---

Instrucciones / system prompt del agente.
```

Ideas de agentes para SmartPeak (crear cuando hagan falta):

- `revisor-diseno` — verifica que un PR de UI cumple [DESIGN.md](../../DESIGN.md) (chrome
  monocromo, cifras en mono, solo tokens, sin los anti-patrones del §0).
- `optimizador-ia` — revisa que las llamadas a la IA preprocesan medias, fuerzan JSON corto y
  cachean (CLAUDE.md §4).
