import React from "react";
import {
  Download,
  Heart,
  Search,
  Volume2,
  Smartphone,
  Shield,
  Zap,
  Globe,
  BookOpen,
  Users,
  Clock,
  Star,
} from "lucide-react";

interface FeaturesSectionProps {
  isVisible?: boolean;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  isVisible = true,
}) => {
  if (!isVisible) return null;

  const features = [
    {
      icon: <Download className="w-6 h-6" />,
      title: "Free Downloads",
      description:
        "Download high-quality Islamic audio content for offline listening",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-950",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Favorites System",
      description:
        "Save your favorite recitations and build your personal collection",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-100 dark:bg-red-950",
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Smart Search",
      description:
        "Find specific surahs, reciters, or topics with intelligent search",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-100 dark:bg-green-950",
    },
    {
      icon: <Volume2 className="w-6 h-6" />,
      title: "HD Audio Quality",
      description:
        "Crystal clear sound with multiple quality options for your preference",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-950",
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile Optimized",
      description:
        "Seamless experience across all devices - phone, tablet, and desktop",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-950",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Safe & Secure",
      description:
        "Trusted content from verified reciters with secure streaming",
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-950",
    },
  ];

  const highlights = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      stat: "1000+",
      label: "Quran Recitations",
    },
    {
      icon: <Users className="w-5 h-5" />,
      stat: "50+",
      label: "Renowned Reciters",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      stat: "100+",
      label: "Hours of Content",
    },
    {
      icon: <Star className="w-5 h-5" />,
      stat: "4.9",
      label: "User Rating",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Features Grid */}
      <div className="bg-gradient-to-br from-muted/20 via-background to-muted/10 rounded-2xl border border-border/50 p-8 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              Powerful Features
            </h3>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Experience the best Islamic audio platform with features designed
            for modern Muslims
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-background/50 rounded-xl p-6 border border-border/30 hover:border-border transition-all duration-300 hover:shadow-lg backdrop-blur-sm"
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl">
                <div
                  className={`w-full h-full bg-gradient-to-br ${feature.color} rounded-xl`}
                ></div>
              </div>

              <div className="relative">
                <div
                  className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}
                >
                  <div
                    className={`text-transparent bg-gradient-to-r ${feature.color} bg-clip-text`}
                  >
                    {feature.icon}
                  </div>
                </div>

                <h4 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                  {feature.title}
                </h4>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((highlight, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <div className="text-primary">{highlight.icon}</div>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {highlight.stat}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {highlight.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-br from-card via-card/95 to-card/90 rounded-xl p-8 border border-border/50">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Globe className="w-6 h-6 text-primary" />
          <h4 className="text-xl font-semibold text-foreground">
            Join Our Community
          </h4>
        </div>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Access thousands of Islamic audio tracks from renowned reciters around
          the world
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-all duration-200 hover:scale-105">
            Start Listening Now
          </button>
          <button className="px-6 py-3 bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground rounded-lg font-medium transition-all duration-200">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};
