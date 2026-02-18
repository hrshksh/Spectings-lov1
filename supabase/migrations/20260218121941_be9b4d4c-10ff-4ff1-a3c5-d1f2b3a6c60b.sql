-- Add quality_score column to leads table
ALTER TABLE public.leads ADD COLUMN quality_score integer DEFAULT NULL;

-- Add a validation trigger to ensure quality_score is between 0 and 100
CREATE OR REPLACE FUNCTION public.validate_lead_quality_score()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.quality_score IS NOT NULL AND (NEW.quality_score < 0 OR NEW.quality_score > 100) THEN
    RAISE EXCEPTION 'quality_score must be between 0 and 100';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_lead_quality_score_trigger
BEFORE INSERT OR UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.validate_lead_quality_score();