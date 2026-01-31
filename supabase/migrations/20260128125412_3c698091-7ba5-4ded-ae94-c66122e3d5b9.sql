-- Fix function search path for generate_worker_id
CREATE OR REPLACE FUNCTION public.generate_worker_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_id TEXT;
    exists_count INTEGER;
BEGIN
    LOOP
        new_id := 'WKR-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
        SELECT COUNT(*) INTO exists_count FROM public.workers WHERE worker_id = new_id;
        EXIT WHEN exists_count = 0;
    END LOOP;
    RETURN new_id;
END;
$$;