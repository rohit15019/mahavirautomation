export const defaultProducts = [
  {
    id: 1,
    title: 'Workflow Builder',
    description: 'Visual automation designer with drag-and-drop interface. Build complex workflows without writing code.',
    features: [
      'Visual workflow editor',
      'Pre-built templates library',
      'Real-time testing environment',
      'Version control integration',
      'Unlimited workflow executions'
    ],
    price: 89,
    imageKey: 'workflow'
  },
  {
    id: 2,
    title: 'Data Sync Pro',
    description: 'Keep your data synchronized across all platforms. Real-time updates, zero data loss.',
    features: [
      'Bi-directional sync',
      'Support for 200+ integrations',
      'Conflict resolution engine',
      'Data transformation tools',
      'Scheduled sync jobs'
    ],
    price: 129,
    imageKey: 'datasync'
  },
  {
    id: 3,
    title: 'Process Analytics',
    description: 'Deep insights into your automated workflows. Track performance, identify bottlenecks, optimize efficiency.',
    features: [
      'Real-time dashboards',
      'Custom report builder',
      'Performance metrics tracking',
      'Anomaly detection alerts',
      'Export to CSV/PDF'
    ],
    price: 149,
    imageKey: 'workflow'
  },
  {
    id: 4,
    title: 'Team Collaboration Hub',
    description: 'Centralized workspace for your automation team. Share workflows, collaborate in real-time.',
    features: [
      'Team workspaces',
      'Role-based permissions',
      'Activity feed and notifications',
      'Commenting and annotations',
      'Shared template library'
    ],
    price: 199,
    imageKey: 'team'
  },
  {
    id: 5,
    title: 'Enterprise Suite',
    description: 'Complete automation platform for large organizations. Advanced security, dedicated support, custom integrations.',
    features: [
      'All Pro features included',
      'SSO and SAML authentication',
      'Dedicated account manager',
      'Custom integration development',
      'SLA guarantee (99.9% uptime)'
    ],
    price: 499,
    imageKey: 'team'
  }
];

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1.0/Product`;

export const getProducts = async () => {
  try {
    const response = await fetch(API_URL);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error(`Server error fetching products: ${response.status}`);
    }
  } catch (error) {
    console.error('Network error fetching products:', error);
  }
  return defaultProducts;
};

export const saveProducts = async (products) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(products)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server returned ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error('Error saving products:', error);
    throw error;
  }
};
