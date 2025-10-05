import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import DynamicForm from '@/components/forms/DynamicForm'
import { MarkdownComponent, AuthorizationComponent, CodeComponent, UserProfileComponent } from '@/components/forms/CustomComponents'
import { apiService } from '@/services/api'
import { 
  Search, 
  Settings, 
  X, 
  ChevronRight, 
  Loader2, 
  Brain, 
  Zap, 
  Target,
  BarChart3,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const ResearchPage = () => {
  const { searchId } = useParams()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [formConfig, setFormConfig] = useState(null)
  const [isFormLoading, setIsFormLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [researchData, setResearchData] = useState(null)
  const [submitResult, setSubmitResult] = useState(null)
  
  // Get agent ID from location state or default to market-research
  const agentId = location.state?.agentId || 'market-research'

  // Custom components for the dynamic form
  const customComponents = {
    markdown_content: MarkdownComponent,
    authorization: AuthorizationComponent,
    code_snippet: CodeComponent,
    user_profile: UserProfileComponent
  }

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false)
      setResearchData({
        title: getResearchTitle(agentId),
        status: 'Initializing',
        progress: 15,
        agentId: agentId,
        insights: getInitialInsights(agentId)
      })
      
      // Simulate sidebar opening after content loads
      setTimeout(() => {
        setIsSidebarOpen(true)
        fetchFormConfig()
      }, 1000)
    }, 2000)

    return () => clearTimeout(timer)
  }, [searchId, agentId])

  const getResearchTitle = (agentId) => {
    const titles = {
      'market-research': 'Market Research Analysis',
      'content-strategy': 'Content Strategy Planning',
      'technical-documentation': 'Technical Documentation Generation'
    }
    return titles[agentId] || 'Research Analysis'
  }

  const getInitialInsights = (agentId) => {
    const insights = {
      'market-research': [
        'Initializing market data collection',
        'Setting up competitive analysis framework',
        'Preparing trend analysis algorithms'
      ],
      'content-strategy': [
        'Analyzing target audience patterns',
        'Evaluating content performance metrics',
        'Preparing strategy recommendations'
      ],
      'technical-documentation': [
        'Scanning code structure and dependencies',
        'Identifying documentation requirements',
        'Preparing template frameworks'
      ]
    }
    return insights[agentId] || insights['market-research']
  }

  const fetchFormConfig = async () => {
    setIsFormLoading(true)
    
    try {
      const response = await apiService.getFormConfig(agentId)
      if (response.success) {
        setFormConfig(response.data)
      } else {
        console.error('Failed to fetch form config:', response.error)
      }
    } catch (error) {
      console.error('Error fetching form config:', error)
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true)
    setSubmitResult(null)
    
    try {
      const response = await apiService.submitChat(agentId, formData)
      if (response.success) {
        setSubmitResult(response.data)
        setIsSidebarOpen(false)
        
        // Update research status
        setResearchData(prev => ({
          ...prev,
          status: 'Processing',
          progress: 45,
          insights: [
            ...prev.insights,
            'Configuration updated successfully',
            'Processing with new parameters'
          ]
        }))
      } else {
        setSubmitResult({ error: response.error })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitResult({ error: 'Failed to submit form data' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const SkeletonCard = () => (
    <Card className="mb-6">
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background relative">
      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'mr-96' : 'mr-0'}`}>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Research Session</h1>
                <p className="text-muted-foreground">ID: {searchId}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Configure
            </Button>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="space-y-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Success/Error Messages */}
              {submitResult && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  {submitResult.error ? (
                    <Card className="border-destructive">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-destructive">
                          <AlertCircle className="h-5 w-5" />
                          <span className="font-medium">Error</span>
                        </div>
                        <p className="text-sm mt-2">{submitResult.error}</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">Success</span>
                        </div>
                        <p className="text-sm mt-2">{submitResult.message}</p>
                        {submitResult.estimatedCompletion && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Estimated completion: {submitResult.estimatedCompletion}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}

              {/* Status Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      {researchData?.title}
                    </CardTitle>
                    <Badge variant={researchData?.status === 'Updated' ? 'default' : 'secondary'}>
                      {researchData?.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{researchData?.progress}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <motion.div
                          className="bg-primary h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${researchData?.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        <span className="text-sm">Market Analysis</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        <span className="text-sm">Data Processing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm">Report Generation</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Insights Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {researchData?.insights?.map((insight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span>{insight}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Activity Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Research Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-primary rounded-full" />
                      <div className="flex-1">
                        <p className="font-medium">Research initiated</p>
                        <p className="text-sm text-muted-foreground">Started market analysis</p>
                      </div>
                      <span className="text-sm text-muted-foreground">2 min ago</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-primary/60 rounded-full" />
                      <div className="flex-1">
                        <p className="font-medium">Data collection in progress</p>
                        <p className="text-sm text-muted-foreground">Gathering market data</p>
                      </div>
                      <span className="text-sm text-muted-foreground">1 min ago</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-muted rounded-full" />
                      <div className="flex-1">
                        <p className="font-medium text-muted-foreground">Analysis pending</p>
                        <p className="text-sm text-muted-foreground">Waiting for data processing</p>
                      </div>
                      <span className="text-sm text-muted-foreground">Pending</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Animated Right Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-1/3 bg-background border-l shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Research Configuration
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {isFormLoading ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <DynamicForm
                      formConfig={formConfig}
                      onSubmit={handleFormSubmit}
                      isLoading={isSubmitting}
                      customComponents={customComponents}
                      className="border-0 shadow-none"
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ResearchPage

