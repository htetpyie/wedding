-- Publish previously pending wishes, as requested by the couple.
UPDATE wishes SET approved = 1 WHERE approved = 0;
