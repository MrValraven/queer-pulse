# pulse-progress

A cosmetic Claude Code mod in QueerPulse colours. It shows the subagents of a session. It does not change what Claude does.

- **Band above the prompt**: "Pulse", a dithered bar from coral to rose to jade, finished subagents out of all subagents, and a pride crab that walks while work runs. `×N` opens the panel. `✕` hides the band and clears the finished runs. The next subagent shows the band again.
- **Panel** (`/pulse` opens or closes it, `/pulse open` only opens it): running and finished subagents with model, context fill, tokens, estimated cost and time.
- **Crabs by role**: `*-engineer` and `*-animator` wear a hard hat, `*-reviewer` a detective hat, `Explore` a pirate hat, `Plan` a space helmet. All other types hold a pride flag. `prefers-reduced-motion` stops the motion.

## What it does not do

This mod only watches. Compared to savvy-progress, it removes all behaviour changes:

- It registers no tools that the model can call. (savvy-progress adds `progress` and `step`, and puts `step` in the tool list of every subagent.)
- It does not change subagent prompts. (savvy-progress adds a reporting instruction to each `savvy-*` brief.)
- It does not read settings or environment variables. (savvy-progress reads them for the language.)
- It has no network, file or process access.

If the mod has an error, the subagent starts as usual.

Cost is an estimate from token counts and a fixed price table (`PRICES` in `hooks/register.tsx`). It is not a bill.

## Settings

`autoOpen`: `once` (default) opens the panel the first time a subagent starts in a session. `never` opens it only with `/pulse`.

## Install

In a Claude Code terminal session:

```
/plugin install pulse-progress --marketplace MrValraven/queer-pulse
```

To try it from a local clone without installing:

```
claude --plugin-dir claude-mods/pulse-progress
```

## Check it

```
claude plugin validate claude-mods/pulse-progress
claude plugin test claude-mods/pulse-progress
```
