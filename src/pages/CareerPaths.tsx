import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { CareerPath } from '../types';
import { GlassCard } from '../components/GlassCard';
import { Search, ChevronRight, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CareerPaths() {
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchPaths() {
      const pathsPath = 'career_paths';
      try {
        const snap = await getDocs(collection(db, pathsPath));
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CareerPath));
        
        if (data.length === 0) {
          setPaths([
            { 
              id: '1', 
              title: 'AI Engineer', 
              description: 'Design and implement machine learning models and AI systems.', 
              skillsRequired: ['Python', 'PyTorch', 'Linear Algebra', 'MLOps'], 
              roadmap: [
                { id: 'ai-1', title: 'Python for Data Science', description: 'Master Python basics and libraries like NumPy/Pandas.', learningUrl: 'https://www.freecodecamp.org/learn/data-analysis-with-python/' },
                { id: 'ai-2', title: 'Machine Learning Specialization', description: 'Learn regression, classification, and clustering.', learningUrl: 'https://www.coursera.org/specializations/machine-learning-introduction' },
                { id: 'ai-3', title: 'Deep Learning Basics', description: 'Understand neural networks and backpropagation.', learningUrl: 'https://www.deeplearning.ai/courses/neural-networks-deep-learning/' }
              ] 
            },
            { 
              id: '2', 
              title: 'Web Developer', 
              description: 'Create modern, responsive web applications using the latest technologies.', 
              skillsRequired: ['React', 'TypeScript', 'Node.js', 'Tailwind'], 
              roadmap: [
                { id: 'web-1', title: 'Responsive Web Design', description: 'HTML5, CSS3, and Flexbox/Grid.', learningUrl: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/' },
                { id: 'web-2', title: 'JavaScript Algorithms', description: 'Core JS logic and data structures.', learningUrl: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/' },
                { id: 'web-3', title: 'React & Redux', description: 'Modern frontend development with React.', learningUrl: 'https://www.freecodecamp.org/learn/front-end-development-libraries/' }
              ] 
            },
            { 
              id: '3', 
              title: 'Data Scientist', 
              description: 'Analyze complex data sets to derive actionable insights and predictions.', 
              skillsRequired: ['SQL', 'Pandas', 'Statistics', 'Tableau'], 
              roadmap: [
                { id: 'ds-1', title: 'SQL for Data Science', description: 'Querying and managing relational databases.', learningUrl: 'https://www.khanacademy.org/computing/computer-programming/sql' },
                { id: 'ds-2', title: 'Statistical Thinking', description: 'Probability and descriptive statistics.', learningUrl: 'https://www.edx.org/course/introduction-to-statistics' }
              ] 
            },
            { 
              id: '4', 
              title: 'Core Engineer', 
              description: 'Focus on hardware, embedded systems, and low-level software.', 
              skillsRequired: ['C/C++', 'Embedded Systems', 'RTOS', 'FPGA'], 
              roadmap: [
                { id: 'core-1', title: 'C Programming for Beginners', description: 'Low-level programming fundamentals.', learningUrl: 'https://www.edx.org/course/c-programming-getting-started' },
                { id: 'core-2', title: 'Embedded Systems Intro', description: 'Microcontrollers and hardware interfacing.', learningUrl: 'https://www.edx.org/course/embedded-systems-shape-the-world-microcontroller-input-output' }
              ] 
            }
          ]);
        } else {
          setPaths(data);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, pathsPath);
      } finally {
        setLoading(false);
      }
    }
    fetchPaths();
  }, []);

  const filteredPaths = paths.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 pb-32 space-y-8 max-w-5xl mx-auto">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Briefcase size={32} className="text-blue-400" />
          Explore Career Paths
        </h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search careers, skills, or roles..." 
            className="w-full glass-input pl-12 py-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-white/5 rounded-3xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPaths.map((path) => (
            <GlassCard key={path.id} className="group flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors">{path.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{path.description}</p>
                <div className="flex flex-wrap gap-2">
                  {path.skillsRequired.map(skill => (
                    <span key={skill} className="text-[10px] px-2 py-1 bg-blue-500/10 text-blue-300 rounded-full border border-blue-500/20">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <Link 
                to={`/roadmap?path=${path.id}`} 
                className="mt-6 glass-button w-full flex items-center justify-center gap-2 text-sm font-semibold"
              >
                Start Roadmap <ChevronRight size={16} />
              </Link>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
