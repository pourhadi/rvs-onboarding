import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Home({ supabaseSession }) {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({ 2: [], 3: [] });
  const [formValues, setFormValues] = useState({
    about: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    birthdate: ''
  });
  const [authForm, setAuthForm] = useState({ email: '', password: '' });

  // Initialize config and user profile state
  useEffect(() => {
    const init = async () => {
      // Load admin config for pages 2 and 3
      const { data: configs } = await supabase.from('page_components').select('*');
      if (configs) {
        const cfg = { 2: [], 3: [] };
        configs.forEach((c) => {
          cfg[c.page] = [...(cfg[c.page] || []), c.component];
        });
        setConfig(cfg);
      }
      if (supabaseSession) {
        const userId = supabaseSession.user.id;
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (error || !profile) {
          // Create initial profile
          await supabase.from('profiles').insert({ id: userId, last_page: 1 });
          setStep(2);
        } else {
          // Prefill form and set next step
          setFormValues({
            about: profile.about || '',
            street: profile.street || '',
            city: profile.city || '',
            state: profile.state || '',
            zip: profile.zip || '',
            birthdate: profile.birthdate || ''
          });
          const nextStep = profile.last_page < 3 ? profile.last_page + 1 : 3;
          setStep(nextStep);
        }
      }
      setLoading(false);
    };
    init();
  }, [supabaseSession]);

  // Handle signup form submission
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { email, password } = authForm;
    // Attempt to sign up the user
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      // Show error and stop loading
      alert(error.message);
      setLoading(false);
      return;
    }
    // If no session is returned, email confirmation is required
    if (!data.session) {
      alert('A confirmation email has been sent. Please check your inbox to verify your account.');
      setLoading(false);
      return;
    }
    // On success (session exists), auth listener will handle updating session and advancing to step 2
  };

  // Handle each wizard step submission
  const handleNext = async () => {
    setLoading(true);
    const userId = supabaseSession.user.id;
    const updates = { last_page: step };
    // Populate fields based on config for the current step
    config[step].forEach((comp) => {
      if (comp === 'about_me') updates.about = formValues.about;
      if (comp === 'address') {
        updates.street = formValues.street;
        updates.city = formValues.city;
        updates.state = formValues.state;
        updates.zip = formValues.zip;
      }
      if (comp === 'birthdate') updates.birthdate = formValues.birthdate;
    });
    await supabase.from('profiles').update(updates).eq('id', userId);
    setStep(step + 1);
    setLoading(false);
  };


  if (loading) return <div>Loading...</div>;

  // If not authenticated, show signup/login
  if (!supabaseSession) {
    return (
      <div className="auth-container">
        <h1 className="title">Sign Up / Login</h1>
        <form onSubmit={handleAuthSubmit}>
          <div className="form-field">
            <input
              type="email"
              placeholder="Email"
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              required
            />
          </div>
          <div className="form-field">
            <input
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn">Sign Up</button>
        </form>
      </div>
    );
  }
  
  // If onboarding complete, show thank you message
  if (step > 3) {
    return (
      <div className="auth-container">
        <h1 className="title">Onboarding Complete</h1>
        <p>Thank you for completing the onboarding flow.</p>
      </div>
    );
  }

  // Render wizard steps
  return (
    <div className="auth-container">
      <h1 className="title">Onboarding - Step {step}</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleNext();
        }}
      >
        {config[step]?.includes('about_me') && (
          <div className="form-field">
            <label>About Me</label>
            <textarea
              value={formValues.about}
              onChange={(e) => setFormValues({ ...formValues, about: e.target.value })}
            />
          </div>
        )}
        {config[step]?.includes('address') && (
          <div className="form-field">
            <label>Street Address</label>
            <input
              type="text"
              value={formValues.street}
              onChange={(e) => setFormValues({ ...formValues, street: e.target.value })}
            />
            <input
              type="text"
              placeholder="City"
              value={formValues.city}
              onChange={(e) => setFormValues({ ...formValues, city: e.target.value })}
            />
            <input
              type="text"
              placeholder="State"
              value={formValues.state}
              onChange={(e) => setFormValues({ ...formValues, state: e.target.value })}
            />
            <input
              type="text"
              placeholder="Zip"
              value={formValues.zip}
              onChange={(e) => setFormValues({ ...formValues, zip: e.target.value })}
            />
          </div>
        )}
        {config[step]?.includes('birthdate') && (
          <div className="form-field">
            <label>Birthdate</label>
            <input
              type="date"
              value={formValues.birthdate}
              onChange={(e) => setFormValues({ ...formValues, birthdate: e.target.value })}
            />
          </div>
        )}
        <button type="submit" className="btn">
          {step < 3 ? 'Next' : 'Finish'}
        </button>
      </form>
    </div>
  );
}