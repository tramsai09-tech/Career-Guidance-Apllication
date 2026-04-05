import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { CareerPath, SkillProgress } from '../types';
import { BookOpen, TrendingUp, Award, ChevronRight, PlusCircle, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

import { Skeleton } from '../components/Skeleton';

export default function Dashboard() {
  const { profile } = useAuth();
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [skills, setSkills] = useState<SkillProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!profile?.uid) return;
      
      const pathsPath = 'career_paths';
      const skillsPath = `users/${profile.uid}/skill_progress`;
      
      try {
        // Fetch career paths
        const pathsSnap = await getDocs(query(collection(db, pathsPath), limit(3)));
        const paths = pathsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CareerPath));
        setCareerPaths(paths);

        // Mock data if empty for demo
        if (paths.length === 0) {
          setCareerPaths([
            { id: '1', title: 'AI Engineer', description: 'Build intelligent systems and models.', skillsRequired: ['Python', 'ML', 'Math'], roadmap: [] },
            { id: '2', title: 'Full Stack Dev', description: 'Build end-to-end web applications.', skillsRequired: ['React', 'Node', 'SQL'], roadmap: [] }
          ]);
        }

        // Fetch real skills from Firestore
        const skillsSnap = await getDocs(collection(db, skillsPath));
        const userSkills = skillsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SkillProgress));
        setSkills(userSkills);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (profile) fetchData();
  }, [profile]);

  if (loading) {
    return (
      <div className="p-6 space-y-8 max-w-5xl mx-auto">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-48 rounded-3xl" />
              <Skeleton className="h-48 rounded-3xl" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-64 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-32 space-y-8 max-w-5xl mx-auto">
      <header className="space-y-1">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-white"
        >
          Hi {profile?.name.split(' ')[0]} 👋
        </motion.h1>
        <p className="text-slate-400">Ready to level up your engineering career today?</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Career Suggestions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BookOpen size={20} className="text-blue-400" />
              Career Suggestions
            </h2>
            <Link to="/career-paths" className="text-sm text-blue-400 hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {careerPaths.map((path) => (
              <Link key={path.id} to={`/roadmap?path=${path.id}`}>
                <GlassCard className="p-5 h-full flex flex-col justify-between group cursor-pointer">
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors">{path.title}</h3>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">{path.description}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {path.skillsRequired.slice(0, 3).map(skill => (
                      <span key={skill} className="text-[10px] px-2 py-1 bg-white/5 rounded-full border border-white/10">{skill}</span>
                    ))}
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>

        {/* Skill Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp size={20} className="text-purple-400" />
              Skill Progress
            </h2>
            <Link to="/roadmap" className="p-1 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors">
              <PlusCircle size={20} />
            </Link>
          </div>
          <GlassCard className="space-y-6">
            {skills.length > 0 ? (
              <>
                {skills.map((skill) => (
                  <div key={skill.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{skill.skillName}</span>
                      <span className="text-slate-400">{skill.progress}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full",
                          skill.progress === 100 ? "bg-green-500" : "bg-gradient-to-r from-blue-500 to-purple-500"
                        )}
                      />
                    </div>
                  </div>
                ))}
                <Link to="/roadmap" className="w-full py-2 text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1">
                  View Roadmap <ChevronRight size={16} />
                </Link>
              </>
            ) : (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-slate-500">
                  <Target size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-300">No skills tracked yet</p>
                  <p className="text-xs text-slate-500">Start a roadmap to track your progress</p>
                </div>
                <Link to="/career-paths" className="inline-block glass-button text-xs py-2">
                  Find a Career Path
                </Link>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Recommended Courses */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Award size={20} className="text-pink-400" />
          Recommended Courses
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {[
            { title: 'Advanced Algorithms', platform: 'Coursera', color: 'from-blue-500/20' },
            { title: 'Cloud Architecture', platform: 'Udemy', color: 'from-purple-500/20' },
            { title: 'AI Ethics', platform: 'edX', color: 'from-pink-500/20' }
          ].map((course, i) => (
            <GlassCard key={i} className={cn("min-w-[240px] p-5 border-l-4", course.color.replace('/20', ''))}>
              <h4 className="font-bold">{course.title}</h4>
              <p className="text-sm text-slate-400">{course.platform}</p>
              <button className="mt-4 text-xs font-semibold text-blue-400">Start Learning</button>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  );
}
