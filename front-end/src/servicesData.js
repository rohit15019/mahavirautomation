export const defaultServices = [
  {
    id: 1,
    iconName: "Workflow",
    title: "Workflow automation",
    description: "Design and deploy custom automation workflows tailored to your business processes. From simple tasks to complex multi-step operations.",
    features: [
      "Custom workflow design and implementation",
      "Integration with existing tools and systems",
      "Ongoing optimization and maintenance",
      "Training for your team members",
      "Performance monitoring and reporting"
    ]
  },
  {
    id: 2,
    iconName: "Database",
    title: "Data integration",
    description: "Connect all your data sources into a unified system. Real-time synchronization, data transformation, and quality assurance.",
    features: [
      "Connect 200+ platforms and services",
      "Real-time and scheduled data sync",
      "Data validation and cleansing",
      "Custom API development",
      "Migration from legacy systems"
    ]
  },
  {
    id: 3,
    iconName: "BarChart2",
    title: "Process optimization",
    description: "Analyze your current workflows and identify automation opportunities. We help you work smarter, not harder.",
    features: [
      "Comprehensive process audit",
      "ROI analysis and projections",
      "Bottleneck identification",
      "Efficiency improvement roadmap",
      "Quarterly optimization reviews"
    ]
  },
  {
    id: 4,
    iconName: "Headphones",
    title: "Dedicated support",
    description: "Get expert help whenever you need it. Our support team is available 24/7 to keep your automations running smoothly.",
    features: [
      "24/7 technical support access",
      "Priority response times",
      "Dedicated account manager",
      "Regular health check calls",
      "Emergency troubleshooting"
    ]
  },
  {
    id: 5,
    iconName: "Code",
    title: "Custom development",
    description: "Need something unique? Our engineering team builds custom integrations and features specific to your requirements.",
    features: [
      "Bespoke integration development",
      "Custom workflow components",
      "API and webhook creation",
      "White-label solutions",
      "Full documentation and handoff"
    ]
  }
];

export const getServices = async () => {
  try {
    // Add an abort controller with a short timeout to prevent long delays
    // if the backend server is not running
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 800); // 800ms timeout

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1.0/Services`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      return await response.json();
    }
  } catch {
    console.warn("Backend not available or timed out, falling back to local data.");
  }
  
  const stored = localStorage.getItem('app_services');
  if (stored) {
    return JSON.parse(stored);
  }
  return defaultServices;
};

export const saveServices = async (services) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 800);

    await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1.0/Services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },

      body: JSON.stringify(services),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
  } catch {
    console.warn("Backend not available for saving, saving locally instead.");
  }
  
  localStorage.setItem('app_services', JSON.stringify(services));
};
