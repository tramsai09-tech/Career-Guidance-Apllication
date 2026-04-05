import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Map, CheckCircle2, Circle, Clock, ExternalLink, Loader2 } from 'lucide-react';
import { collection, getDocs, doc, getDoc, setDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { GlassCard } from '../components/GlassCard';
import { CareerPath } from '../types';
import { cn } from '../lib/utils';
import { Skeleton } from '../components/Skeleton';
import { useAuth } from '../contexts/AuthContext';

export default function Roadmap() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const pathId = searchParams.get('path');
  const [careerPath, setCareerPath] = useState<CareerPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPath() {
      try {
        if (pathId) {
          const docRef = doc(db, 'career_paths', pathId);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            setCareerPath({ id: snap.id, ...snap.data() } as CareerPath);
          } else {
            // Fallback to mock if not in DB
            const mockPaths = [
              { id: '1', title: 'AI Engineer', roadmap: [
                { id: 'ai-1', title: 'Python for Data Science', description: 'Master Python basics and libraries like NumPy/Pandas.', learningUrl: 'https://www.freecodecamp.org/learn/data-analysis-with-python/' },
                { id: 'ai-2', title: 'Machine Learning Specialization', description: 'Learn regression, classification, and clustering.', learningUrl: 'https://www.coursera.org/specializations/machine-learning-introduction' },
                { id: 'ai-3', title: 'Deep Learning Basics', description: 'Understand neural networks and backpropagation.', learningUrl: 'https://www.deeplearning.ai/courses/neural-networks-deep-learning/' }
              ]},
              { id: '2', title: 'Web Developer', roadmap: [
                { id: 'web-1', title: 'Responsive Web Design', description: 'HTML5, CSS3, and Flexbox/Grid.', learningUrl: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/' },
                { id: 'web-2', title: 'JavaScript Algorithms', description: 'Core JS logic and data structures.', learningUrl: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/' },
                { id: 'web-3', title: 'React & Redux', description: 'Modern frontend development with React.', learningUrl: 'https://www.freecodecamp.org/learn/front-end-development-libraries/' }
              ]}
            ];
            const found = mockPaths.find(p => p.id === pathId);
            if (found) setCareerPath(found as CareerPath);
          }
        }
      } catch (error) {
        console.error('Error fetching roadmap:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPath();
  }, [pathId]);

  // Sync progress from Firestore
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'users', user.uid, 'skill_progress'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prog: Record<string, any> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        prog[doc.id] = data;
      });
      setProgress(prog);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/skill_progress`);
    });

    return () => unsubscribe();
  }, [user]);

  const handleToggleComplete = async (stepId: string, stepTitle: string) => {
    if (!user) return;
    setUpdating(stepId);

    try {
      const isCompleted = progress[stepId]?.status === 'Completed';
      const skillRef = doc(db, 'users', user.uid, 'skill_progress', stepId);
      
      await setDoc(skillRef, {
        userId: user.uid,
        skillId: stepId,
        skillName: stepTitle,
        progress: isCompleted ? 0 : 100,
        status: isCompleted ? 'Pending' : 'Completed'
      }, { merge: true });

    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/skill_progress`);
    } finally {
      setUpdating(null);
    }
  };

  const completedCount = careerPath?.roadmap.filter(s => progress[s.id]?.status === 'Completed').length || 0;
  const totalSteps = careerPath?.roadmap.length || 1;
  const completionPercent = Math.round((completedCount / totalSteps) * 100);

  if (loading) {
    return (
      <div className="p-6 space-y-8 max-w-3xl mx-auto">
        <Skeleton className="h-12 w-64" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
        </div>
      </div>
    );
  }

  if (!careerPath) {
    return (
      <div className="p-6 text-center space-y-4 min-h-[60vh] flex flex-col items-center justify-center">
        <Map size={48} className="text-slate-600" />
        <h2 className="text-xl font-bold">No Roadmap Selected</h2>
        <p className="text-slate-400">Please select a career path from the Explore screen.</p>
      </div>
    );
  }

  return (
    <div className="p-6 pb-32 space-y-8 max-w-3xl mx-auto">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Map size={32} className="text-purple-400" />
          {careerPath.title} Roadmap
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
          <span className="text-sm font-medium text-slate-400">{completionPercent}% Complete</span>
        </div>
      </header>

      <div className="space-y-4 relative">
        <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-white/10" />
        
        {careerPath.roadmap.map((step, index) => {
          const isActive = activeStep === step.id;
          const isCompleted = progress[step.id]?.status === 'Completed';

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setActiveStep(step.id)}
              className="relative pl-14 cursor-pointer"
            >
              <div className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all duration-300",
                isCompleted 
                  ? "bg-green-500 text-white border-green-500" 
                  : "bg-slate-800 text-slate-500 border border-white/10"
              )}>
                {isCompleted ? <CheckCircle2 size={14} /> : <Circle size={14} />}
              </div>

              <GlassCard className={cn(
                "p-5 transition-all duration-300",
                isActive ? "border-blue-500/50 bg-white/15" : "opacity-60 grayscale-[0.5]",
                isCompleted && !isActive && "opacity-80 grayscale-0 border-green-500/20"
              )}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className={cn(
                      "font-bold text-lg",
                      isCompleted && "text-green-400"
                    )}>{step.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{step.description}</p>
                  </div>
                  <a 
                    href={step.learningUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>
                
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-white/10 space-y-3"
                  >
                    <p className="text-xs text-slate-500">
                      Click the external link icon to visit the best free certification for this skill.
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleComplete(step.id, step.title);
                      }}
                      disabled={updating === step.id}
                      className={cn(
                        "w-full py-2 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2",
                        isCompleted 
                          ? "bg-slate-700 text-slate-300 shadow-none" 
                          : "bg-blue-500 text-white shadow-blue-500/20"
                      )}
                    >
                      {updating === step.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : isCompleted ? (
                        "Mark as Incomplete"
                      ) : (
                        "Mark as Completed"
                      )}
                    </button>
                  </motion.div>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
