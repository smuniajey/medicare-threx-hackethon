-- Fix the remaining policies that weren't created due to duplicate error
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Doctors can insert medical visits" ON public.medical_visits;
DROP POLICY IF EXISTS "Doctors and admins can view medical visits" ON public.medical_visits;
DROP POLICY IF EXISTS "Admins can manage workers" ON public.workers;
DROP POLICY IF EXISTS "Doctors can view workers" ON public.workers;

-- Recreate the policies
CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors can insert medical visits"
ON public.medical_visits
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors and admins can view medical visits"
ON public.medical_visits
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage workers"
ON public.workers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors can view workers"
ON public.workers
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'doctor'));