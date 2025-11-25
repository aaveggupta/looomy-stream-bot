-- Update all existing bot configs to use new defaults
-- Bot name: "Looomy" (was "LooomyBot")
-- Trigger phrase: "@looomybot" (was "@Looomy")

UPDATE "BotConfig"
SET
  "botName" = 'Looomy',
  "triggerPhrase" = '@looomybot'
WHERE "botName" != 'Looomy' OR "triggerPhrase" != '@looomybot';
