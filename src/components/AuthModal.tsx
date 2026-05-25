import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { Sparkles, Shield, Mail, Lock, User, AlertCircle, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fallback for browsers without closedby support
  useEffect(() => {
    const dialog = document.getElementById('auth-dialog') as HTMLDialogElement | null;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  const handleClose = () => {
    setError(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    onClose();
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError('Firebase SDK is not configured.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName.trim()) {
          await updateProfile(userCredential.user, { displayName: displayName.trim() });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      handleClose();
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message;
      if (err.code === 'auth/invalid-credential') {
        errMsg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = 'This email is already in use.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Password must be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Invalid email address format.';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog 
      id="auth-dialog" 
      closedby="any"
      onClose={handleClose}
      style={{
        padding: '28px',
        maxWidth: '420px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 className="section-title" style={{ margin: 0 }}>
          <Sparkles size={18} style={{ color: 'var(--color-accent)' }} /> 
          {isSignUp ? 'Create Cloud Account' : 'Sign In to Cloud Sync'}
        </h3>
        <button onClick={handleClose} className="btn-icon" aria-label="Close modal">
          <X size={16} />
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(248, 113, 113, 0.1)',
          border: '1px solid var(--color-danger)',
          color: 'var(--color-danger)',
          padding: '10px 12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {isSignUp && (
          <div className="form-group">
            <label>Name (Optional)</label>
            <div style={{ position: 'relative' }}>
              <User size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                value={displayName} 
                onChange={e => setDisplayName(e.target.value)} 
                placeholder="e.g. David Anderson" 
                className="form-control" 
                style={{ paddingLeft: '32px' }}
              />
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              required 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="e.g. name@domain.com" 
              className="form-control" 
              style={{ paddingLeft: '32px' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              required 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
              className="form-control" 
              style={{ paddingLeft: '32px' }}
              minLength={6}
            />
          </div>
        </div>

        {isSignUp && (
          <div className="form-group">
            <label>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                required 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                placeholder="••••••••" 
                className="form-control" 
                style={{ paddingLeft: '32px' }}
              />
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', padding: '12px', marginTop: '6px' }}
        >
          {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
        </button>
      </form>

      <div style={{ 
        textAlign: 'center', 
        marginTop: '16px', 
        borderTop: '1px solid var(--card-border)', 
        paddingTop: '16px',
        fontSize: '12px',
        color: 'var(--text-secondary)'
      }}>
        <span>
          {isSignUp ? 'Already have an account? ' : "Don't have a cloud account? "}
        </span>
        <button 
          onClick={() => { setError(null); setIsSignUp(!isSignUp); }} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--color-accent)', 
            fontWeight: '600', 
            cursor: 'pointer',
            padding: 0
          }}
        >
          {isSignUp ? 'Sign In' : 'Sign Up Free'}
        </button>
      </div>

      <div style={{
        marginTop: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        color: 'var(--text-muted)',
        fontSize: '10px'
      }}>
        <Shield size={11} />
        Secured by Firebase Authentication
      </div>
    </dialog>
  );
};
