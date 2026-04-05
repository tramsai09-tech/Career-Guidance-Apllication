import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Bell, Shield, LogOut, ChevronRight, Camera, 
  X, Check, Github, Linkedin, Loader2, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

type SectionType = 'personal' | 'career' | 'social' | 'notifications' | 'privacy';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: SectionType | null;
  profile: UserProfile | null;
  onSave: (data: Partial<UserProfile>) => Promise<void>;
}

function EditModal({ isOpen, onClose, section, profile, onSave }: EditModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && section && profile) {
      setSuccess(false);
      setError(null);
      switch (section) {
        case 'personal':
          setFormData({ name: profile.name || '' });
          break;
        case 'career':
          setFormData({ careerPreference: profile.careerPreference || 'AI Engineer' });
          break;
        case 'social':
          setFormData({
            linkedin: profile.socialLinks?.linkedin || '',
            github: profile.socialLinks?.github || ''
          });
          break;
        case 'notifications':
          setFormData({
            push: profile.notifications?.push ?? true,
            email: profile.notifications?.email ?? true
          });
          break;
        case 'privacy':
          setFormData({
            profilePublic: profile.privacySettings?.profilePublic ?? true
          });
          break;
      }
    }
  }, [isOpen, section, profile]);

  if (!isOpen || !section) return null;

  const getTitle = () => {
    switch (section) {
      case 'personal': return 'Edit Personal Info';
      case 'career': return 'Edit Career Preferences';
      case 'social': return 'Edit Social Links';
      case 'notifications': return 'Edit Notifications';
      case 'privacy': return 'Edit Privacy Settings';
      default: return 'Edit Settings';
    }
  };

  const validate = () => {
    if (section === 'personal' && !formData.name.trim()) {
      setError('Name cannot be empty');
      return false;
    }
    if (section === 'social') {
      if (formData.linkedin && !formData.linkedin.includes('linkedin.com')) {
        setError('Invalid LinkedIn URL');
        return false;
      }
      if (formData.github && !formData.github.includes('github.com')) {
        setError('Invalid GitHub URL');
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    setLoading(true);
    setError(null);
    try {
      let updateData: Partial<UserProfile> = {};
      switch (section) {
        case 'personal':
          updateData = { name: formData.name };
          break;
        case 'career':
          updateData = { careerPreference: formData.careerPreference };
          break;
        case 'social':
          updateData = { socialLinks: { linkedin: formData.linkedin, github: formData.github } };
          break;
        case 'notifications':
          updateData = { notifications: { push: formData.push, email: formData.email } };
          break;
        case 'privacy':
          updateData = { privacySettings: { profilePublic: formData.profilePublic } };
          break;
      }
      await onSave(updateData);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError('Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">{getTitle()}</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {section === 'personal' && (
              <div className="space-y-2">
                <label className="text-sm text-slate-400 ml-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="Enter your name"
                  autoFocus
                />
              </div>
            )}

            {section === 'career' && (
              <div className="space-y-2">
                <label className="text-sm text-slate-400 ml-1">Preferred Path</label>
                <select
                  value={formData.careerPreference}
                  onChange={(e) => setFormData({ ...formData, careerPreference: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                >
                  <option value="AI Engineer">AI Engineer</option>
                  <option value="Web Developer">Web Developer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Core Engineer">Core Engineer</option>
                </select>
              </div>
            )}

            {section === 'social' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400 ml-1 flex items-center gap-2">
                    <Linkedin size={14} /> LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400 ml-1 flex items-center gap-2">
                    <Github size={14} /> GitHub URL
                  </label>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>
            )}

            {section === 'notifications' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-slate-200">Push Notifications</span>
                  <button
                    onClick={() => setFormData({ ...formData, push: !formData.push })}
                    className={cn(
                      "w-12 h-6 rounded-full p-1 transition-colors duration-300",
                      formData.push ? "bg-blue-500" : "bg-slate-700"
                    )}
                  >
                    <motion.div
                      animate={{ x: formData.push ? 24 : 0 }}
                      className="w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-slate-200">Email Alerts</span>
                  <button
                    onClick={() => setFormData({ ...formData, email: !formData.email })}
                    className={cn(
                      "w-12 h-6 rounded-full p-1 transition-colors duration-300",
                      formData.email ? "bg-blue-500" : "bg-slate-700"
                    )}
                  >
                    <motion.div
                      animate={{ x: formData.email ? 24 : 0 }}
                      className="w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              </div>
            )}

            {section === 'privacy' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-slate-200">Public Profile</span>
                    <span className="text-[10px] text-slate-500">Allow others to see your progress</span>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, profilePublic: !formData.profilePublic })}
                    className={cn(
                      "w-12 h-6 rounded-full p-1 transition-colors duration-300",
                      formData.profilePublic ? "bg-blue-500" : "bg-slate-700"
                    )}
                  >
                    <motion.div
                      animate={{ x: formData.profilePublic ? 24 : 0 }}
                      className="w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-xl"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 p-3 rounded-xl"
              >
                <Check size={14} />
                Changes saved successfully!
              </motion.div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 glass rounded-xl font-bold hover:bg-white/5 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading || success}
                className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : success ? (
                  <Check size={18} />
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

export default function Settings() {
  const { profile, logout, updateProfile } = useAuth();
  const [activeSection, setActiveSection] = useState<SectionType | null>(null);

  const sections = [
    { 
      title: 'Account', 
      icon: User, 
      items: [
        { label: 'Personal Info', value: profile?.name || '', type: 'personal' as const },
        { label: 'Career Preferences', value: profile?.careerPreference || 'Not set', type: 'career' as const },
        { label: 'Social Links', value: profile?.socialLinks?.linkedin ? 'Connected' : 'Not set', type: 'social' as const }
      ] 
    },
    { 
      title: 'Preferences', 
      icon: Bell, 
      items: [
        { label: 'Notifications', value: profile?.notifications?.push ? 'Enabled' : 'Disabled', type: 'notifications' as const },
        { label: 'Privacy & Security', value: profile?.privacySettings?.profilePublic ? 'Public' : 'Private', type: 'privacy' as const }
      ] 
    }
  ];

  return (
    <div className="p-6 pb-32 space-y-8 max-w-2xl mx-auto">
      <header className="text-center space-y-4">
        <div className="relative w-24 h-24 mx-auto">
          <img 
            src={profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.name}&background=random`} 
            alt="Profile" 
            className="w-full h-full rounded-3xl object-cover border-4 border-white/10 shadow-xl"
            referrerPolicy="no-referrer"
          />
          <button className="absolute bottom-[-8px] right-[-8px] w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center border-2 border-slate-950 text-white">
            <Camera size={14} />
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-bold">{profile?.name}</h1>
          <p className="text-slate-400 text-sm">{profile?.email}</p>
        </div>
      </header>

      <div className="space-y-6">
        {sections.map((section, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="space-y-3"
          >
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-2">
              <section.icon size={14} />
              {section.title}
            </h2>
            <GlassCard className="p-0 overflow-hidden divide-y divide-white/5">
              {section.items.map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveSection(item.type)}
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left group"
                >
                  <div className="flex flex-col">
                    <span className="text-slate-200 font-medium group-hover:text-blue-400 transition-colors">{item.label}</span>
                    <span className="text-xs text-slate-400 mt-0.5">{item.value}</span>
                  </div>
                  <ChevronRight size={18} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                </button>
              ))}
            </GlassCard>
          </motion.div>
        ))}

        <button
          onClick={logout}
          className="w-full p-4 glass rounded-2xl text-red-400 font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all border-red-500/20"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>

      <AnimatePresence>
        {activeSection && (
          <EditModal
            isOpen={!!activeSection}
            onClose={() => setActiveSection(null)}
            section={activeSection}
            profile={profile}
            onSave={updateProfile}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
