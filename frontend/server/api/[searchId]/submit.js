export default defineEventHandler(async (event) => {
  const searchId = getRouterParam(event, 'searchId')
  const body = await readBody(event)
  
  // Simulate API processing delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Simulate random success/failure for demo (80% success rate)
  const isSuccess = Math.random() > 0.2
  
  if (!isSuccess) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server temporarily unavailable. Please try again later.'
    })
  }
  
  // Log the submission (in real app, this would save to database)
  console.log(`Form submission for searchId: ${searchId}`, body)
  
  // Return success response with different messages based on form type
  const successMessages = {
    '12345': 'Business information submitted successfully! Our team will review your details and contact you within 24 hours.',
    '67890': 'Thank you for contacting us! We have received your message and will respond within 2 business days.',
    '34234': 'Project requirements submitted successfully! We will analyze your needs and provide a detailed quote within 48 hours.'
  }
  
  const defaultMessage = 'Form submitted successfully! Thank you for your submission.'
  
  return {
    success: true,
    message: successMessages[searchId] || defaultMessage,
    submissionId: `${searchId}-${Date.now()}`,
    estimatedResponse: getEstimatedResponse(searchId),
    submittedData: body
  }
})

function getEstimatedResponse(searchId) {
  const responses = {
    '12345': '24 hours',
    '67890': '2 business days',
    '34234': '48 hours'
  }
  return responses[searchId] || '1-2 business days'
}