// src/pages/Home.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  Compass,
  GraduationCap,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import heroBg from "@/assets/images/heroBg.png";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const featuredCategories = [
    { name: "BSIT", count: 45, icon: "💻", color: "bg-blue-500/10" },
    { name: "BSBA-FM", count: 32, icon: "📊", color: "bg-green-500/10" },
    { name: "BSBA-MM", count: 28, icon: "📱", color: "bg-purple-500/10" },
    { name: "BEED", count: 38, icon: "📚", color: "bg-yellow-500/10" },
    { name: "BSED", count: 42, icon: "✏️", color: "bg-red-500/10" },
  ];

  const featuredEbooks = [
    {
      id: 1,
      title: "Introduction to Computing",
      author: "Dr. Maria Santos",
      category: "BSIT",
      cover: "https://via.placeholder.com/200x280/0e326c/ffffff?text=Computing",
    },
    {
      id: 2,
      title: "Financial Management Basics",
      author: "Prof. Juan Dela Cruz",
      category: "BSBA-FM",
      cover: "https://via.placeholder.com/200x280/6B9AC4/ffffff?text=Finance",
    },
    {
      id: 3,
      title: "Modern Marketing Strategies",
      author: "Ana Reyes",
      category: "BSBA-MM",
      cover: "https://via.placeholder.com/200x280/0e326c/ffffff?text=Marketing",
    },
    {
      id: 4,
      title: "Elementary Education Methods",
      author: "Dr. Luz Mercado",
      category: "BEED",
      cover: "https://via.placeholder.com/200x280/6B9AC4/ffffff?text=Education",
    },
  ];

  return (
    <>
      <Header />

      {/* Hero Section with Search */}
      <section
        className="relative min-h-[85vh] flex items-center"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(10, 25, 47, 0.85), rgba(8, 20, 38, 0.9)), url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fadeIn">
              Welcome to <span className="text-blue-600">OCC </span>
              <span className="text-white">eLibrary</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Your digital gateway to knowledge and learning resources at Opol
              Community College
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for eBooks, authors, or topics..."
                  className="w-full px-6 py-4 pr-14 text-lg rounded-full bg-white shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primaryDark text-white p-2 rounded-full transition-all duration-300 hover:scale-105"
                >
                  <Search className="w-6 h-6" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-bgColor">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-textSecondary">eBooks Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">5+</div>
              <div className="text-textSecondary">Programs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1,000+</div>
              <div className="text-textSecondary">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-textSecondary">Authors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-textPrimary mb-4">
              Browse by Program
            </h2>
            <p className="text-textSecondary max-w-2xl mx-auto">
              Find eBooks specific to your course or program
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {featuredCategories.map((category) => (
              <Link
                key={category.name}
                to={`/program/${category.name.toLowerCase()}/ebooks`}
                className="group"
              >
                <div
                  className={`${category.color} rounded-xl p-6 text-center transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg`}
                >
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold text-textPrimary mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-textSecondary">
                    {category.count} eBooks
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured eBooks */}
      <section className="py-20 bg-bgColor">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-textPrimary mb-2">
                Featured eBooks
              </h2>
              <p className="text-textSecondary">
                Popular titles from our collection
              </p>
            </div>
            <Link
              to="/browse"
              className="text-primary hover:text-primaryDark font-semibold flex items-center gap-2 transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredEbooks.map((ebook) => (
              <Link key={ebook.id} to={`/ebook/${ebook.id}`} className="group">
                <div className="card overflow-hidden hover:transform hover:-translate-y-2 transition-all duration-300">
                  <div className="relative overflow-hidden">
                    <img
                      src={ebook.cover}
                      alt={ebook.title}
                      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 bg-primary/90 text-white text-xs px-2 py-1 rounded-full">
                      {ebook.category}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-textPrimary mb-1 line-clamp-2">
                      {ebook.title}
                    </h3>
                    <p className="text-sm text-textSecondary">{ebook.author}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-textPrimary mb-4">
              Why Choose OCC eLibrary?
            </h2>
            <p className="text-textSecondary max-w-2xl mx-auto">
              Access quality educational resources anytime, anywhere
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-6 text-center hover:transform hover:-translate-y-1 transition-all">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-textPrimary mb-2">
                Extensive Library
              </h3>
              <p className="text-textSecondary">
                Access hundreds of eBooks across various disciplines and
                programs
              </p>
            </div>

            <div className="card p-6 text-center hover:transform hover:-translate-y-1 transition-all">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-textPrimary mb-2">
                Program-Focused
              </h3>
              <p className="text-textSecondary">
                Resources organized by your specific course or program
              </p>
            </div>

            <div className="card p-6 text-center hover:transform hover:-translate-y-1 transition-all">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-textPrimary mb-2">
                Easy Access
              </h3>
              <p className="text-textSecondary">
                Download and read on any device, online or offline
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Join OCC eLibrary today and explore our collection of educational
            resources
          </p>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg"
          >
            Explore eBooks Now
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Home;
