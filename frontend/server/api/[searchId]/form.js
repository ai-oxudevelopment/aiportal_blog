export default defineEventHandler(async (event) => {
  const searchId = getRouterParam(event, 'searchId')
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Mock form schemas based on searchId
  const formSchemas = {
    '12345': [
      {
        $formkit: 'text',
        name: 'companyName',
        label: 'Company Name',
        placeholder: 'Enter your company name',
        validation: 'required|length:2,100',
        help: 'The official name of your company'
      },
      {
        $formkit: 'email',
        name: 'businessEmail',
        label: 'Business Email',
        placeholder: 'Enter your business email',
        validation: 'required|email',
        help: 'We will use this email for business communications'
      },
      {
        $formkit: 'select',
        name: 'industry',
        label: 'Industry',
        placeholder: 'Select your industry',
        validation: 'required',
        options: [
          { label: 'Technology', value: 'tech' },
          { label: 'Healthcare', value: 'healthcare' },
          { label: 'Finance', value: 'finance' },
          { label: 'Education', value: 'education' },
          { label: 'Retail', value: 'retail' },
          { label: 'Other', value: 'other' }
        ]
      },
      {
        $formkit: 'number',
        name: 'employeeCount',
        label: 'Number of Employees',
        placeholder: 'Enter number of employees',
        validation: 'required|min:1|max:10000',
        help: 'Approximate number of employees in your company'
      },
      {
        $formkit: 'textarea',
        name: 'businessDescription',
        label: 'Business Description',
        placeholder: 'Describe your business...',
        validation: 'required|length:10,500',
        help: 'Brief description of your business and services',
        attrs: {
          rows: 4
        }
      }
    ],
    '67890': [
      {
        $formkit: 'text',
        name: 'fullName',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        validation: 'required|length:2,50'
      },
      {
        $formkit: 'email',
        name: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email address',
        validation: 'required|email'
      },
      {
        $formkit: 'tel',
        name: 'phone',
        label: 'Phone Number',
        placeholder: 'Enter your phone number',
        validation: 'required|length:10,15',
        help: 'Include country code if international'
      },
      {
        $formkit: 'select',
        name: 'contactReason',
        label: 'Reason for Contact',
        placeholder: 'Select reason',
        validation: 'required',
        options: [
          { label: 'General Inquiry', value: 'general' },
          { label: 'Technical Support', value: 'support' },
          { label: 'Sales Question', value: 'sales' },
          { label: 'Partnership', value: 'partnership' },
          { label: 'Feedback', value: 'feedback' }
        ]
      },
      {
        $formkit: 'checkbox',
        name: 'newsletter',
        label: 'Subscribe to Newsletter',
        help: 'Receive updates about our products and services'
      },
      {
        $formkit: 'textarea',
        name: 'message',
        label: 'Message',
        placeholder: 'Enter your message here...',
        validation: 'required|length:10,1000',
        attrs: {
          rows: 5
        }
      }
    ],
    '34234': [
      {
        $formkit: 'text',
        name: 'projectName',
        label: 'Project Name',
        placeholder: 'Enter project name',
        validation: 'required|length:3,100',
        help: 'A descriptive name for your project'
      },
      {
        $formkit: 'select',
        name: 'projectType',
        label: 'Project Type',
        placeholder: 'Select project type',
        validation: 'required',
        options: [
          { label: 'Web Application', value: 'web-app' },
          { label: 'Mobile Application', value: 'mobile-app' },
          { label: 'Desktop Application', value: 'desktop-app' },
          { label: 'API/Backend', value: 'api' },
          { label: 'Data Analysis', value: 'data-analysis' },
          { label: 'Machine Learning', value: 'ml' }
        ]
      },
      {
        $formkit: 'date',
        name: 'deadline',
        label: 'Project Deadline',
        validation: 'required',
        help: 'When do you need this project completed?'
      },
      {
        $formkit: 'range',
        name: 'budget',
        label: 'Budget Range ($)',
        min: 1000,
        max: 100000,
        step: 1000,
        validation: 'required',
        help: 'Estimated budget for the project'
      },
      {
        $formkit: 'checkbox',
        name: 'features',
        label: 'Required Features',
        options: [
          { label: 'User Authentication', value: 'auth' },
          { label: 'Database Integration', value: 'database' },
          { label: 'Payment Processing', value: 'payments' },
          { label: 'Real-time Updates', value: 'realtime' },
          { label: 'Mobile Responsive', value: 'responsive' },
          { label: 'API Integration', value: 'api-integration' }
        ],
        help: 'Select all features that apply to your project'
      },
      {
        $formkit: 'textarea',
        name: 'requirements',
        label: 'Detailed Requirements',
        placeholder: 'Describe your project requirements in detail...',
        validation: 'required|length:20,2000',
        attrs: {
          rows: 6
        }
      }
    ]
  }
  
  // Return schema based on searchId, or default contact form
  const schema = formSchemas[searchId] || [
    {
      $formkit: 'text',
      name: 'name',
      label: 'Full Name',
      placeholder: 'Enter your full name',
      validation: 'required|length:2,50'
    },
    {
      $formkit: 'email',
      name: 'email',
      label: 'Email Address',
      placeholder: 'Enter your email address',
      validation: 'required|email'
    },
    {
      $formkit: 'textarea',
      name: 'message',
      label: 'Message',
      placeholder: 'Enter your message here...',
      validation: 'required|length:10,500',
      attrs: {
        rows: 4
      }
    }
  ]
  
  return {
    searchId,
    schema,
    title: getFormTitle(searchId),
    description: getFormDescription(searchId)
  }
})

function getFormTitle(searchId) {
  const titles = {
    '12345': 'Business Information Form',
    '67890': 'Contact Information Form',
    '34234': 'Project Requirements Form'
  }
  return titles[searchId] || 'Contact Form'
}

function getFormDescription(searchId) {
  const descriptions = {
    '12345': 'Please provide your business information to help us understand your needs better.',
    '67890': 'Fill out this form to get in touch with our team.',
    '34234': 'Describe your project requirements so we can provide an accurate quote.'
  }
  return descriptions[searchId] || 'Please fill out this form to contact us.'
}