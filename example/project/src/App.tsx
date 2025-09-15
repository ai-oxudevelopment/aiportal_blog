import React from 'react';
import DialogSection from './components/DialogSection';

const samplePrompt = `
<h3>System Instructions</h3>
<p>You are Captain AI, an intelligent assistant for Chatwoot. Your role is to help users understand the codebase and provide accurate information about the Captain AI modules.</p>
<p><strong>Guidelines:</strong></p>
<ul>
<li>Always reference specific code files when providing explanations</li>
<li>Use technical terminology appropriately</li>
<li>Provide context about how different components interact</li>
</ul>
`;

const sampleUploadedFiles = [
  {
    id: 'doc1',
    name: 'captain-ai-overview.pdf',
    type: 'application/pdf',
    size: '2.4 MB'
  },
  {
    id: 'doc2', 
    name: 'api-documentation.xlsx',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: '1.8 MB'
  },
  {
    id: 'doc3',
    name: 'configuration-notes.txt',
    type: 'text/plain',
    size: '12 KB'
  }
];

const sampleAdditionalText = `
<p>This analysis was performed on the latest version of the Chatwoot codebase (commit: 8606aa13). The Captain AI system represents a significant enhancement to the platform's automation capabilities.</p>
<p><strong>Key findings:</strong></p>
<ul>
<li>Modular architecture allows for easy extension</li>
<li>Comprehensive tool system for various operations</li>
<li>Robust error handling and logging mechanisms</li>
</ul>
`;

const sampleFiles = [
  {
    id: 'config-installation',
    name: 'installation_config.yml',
    path: 'config/installation_config.yml',
    language: 'yaml',
    lineStart: 164,
    lineEnd: 193,
    citations: [0],
    content: `# MARK: Captain Config
- name: CAPTAIN_OPEN_AI_API_KEY
  display_title: 'OpenAI API Key'
  description: 'The API key used to authenticate requests to OpenAI services for Captain AI.'
  locked: false
  type: secret
- name: CAPTAIN_OPEN_AI_MODEL
  display_title: 'OpenAI Model'
  description: 'The OpenAI model configured for use in Captain AI. Default: gpt-4o-mini'
  locked: false
- name: CAPTAIN_OPEN_AI_ENDPOINT
  display_title: 'OpenAI API Endpoint (optional)'
  description: 'The OpenAI endpoint configured for use in Captain AI. Default: https://api.openai.com/'
  locked: false
- name: CAPTAIN_EMBEDDING_MODEL
  display_title: 'Embedding Model (optional)'
  description: 'The embedding model configured for use in Captain AI. Default: text-embedding-3-small'
  locked: false
- name: CAPTAIN_FIRECRAWL_API_KEY
  display_title: 'FireCrawl API Key (optional)'
  description: 'The FireCrawl API key for the Captain AI service'
  locked: false
  type: secret
- name: CAPTAIN_CLOUD_PLAN_LIMITS
  display_title: 'Captain Cloud Plan Limits'
  description: 'The limits for the Captain AI service for different plans'
  value:
  type: code

# End of Captain Config`
  },
  {
    id: 'assistant-model',
    name: 'assistant.rb',
    path: 'enterprise/app/models/captain/assistant.rb',
    language: 'ruby',
    lineStart: 19,
    lineEnd: 43,
    citations: [1, 2, 3],
    content: `class Captain::Assistant < ApplicationRecord
  include Avatarable
  include Concerns::CaptainToolsHelpers
  include Concerns::Agentable

  self.table_name = 'captain_assistants'

  belongs_to :account
  has_many :documents, class_name: 'Captain::Document', dependent: :destroy_async
  has_many :responses, class_name: 'Captain::AssistantResponse', dependent: :destroy_async
  has_many :captain_inboxes,
           class_name: 'CaptainInbox',
           foreign_key: :captain_assistant_id,
           dependent: :destroy_async
  has_many :inboxes,
           through: :captain_inboxes
  has_many :messages, as: :sender, dependent: :nullify
  has_many :copilot_threads, dependent: :destroy_async
  has_many :scenarios, class_name: 'Captain::Scenario', dependent: :destroy_async

  store_accessor :config, :temperature, :feature_faq, :feature_memory, :product_name

  validates :name, presence: true
  validates :description, presence: true
  validates :account_id, presence: true`
  },
  {
    id: 'assistant-chat-service',
    name: 'assistant_chat_service.rb',
    path: 'enterprise/app/services/captain/llm/assistant_chat_service.rb',
    language: 'ruby',
    lineStart: 3,
    lineEnd: 26,
    citations: [4],
    content: `class Captain::Llm::AssistantChatService < Llm::BaseOpenAiService
  include Captain::ChatHelper

  def initialize(assistant: nil)
    super()

    @assistant = assistant
    @messages = [system_message]
    @response = ''
    register_tools
  end

  # additional_message: A single message (String) from the user that should be appended to the chat.
  #                    It can be an empty String or nil when you only want to supply historical messages.
  # message_history:   An Array of already formatted messages that provide the previous context.
  # role:              The role for the additional_message (defaults to \`user\`).
  #
  # NOTE: Parameters are provided as keyword arguments to improve clarity and avoid relying on
  # positional ordering.
  def generate_response(additional_message: nil, message_history: [], role: 'user')
    @messages += message_history
    @messages << { role: role, content: additional_message } if additional_message.present?
    request_chat_completion
  end`
  }
];

const sampleContent = `
<h1>Captain and AI Modules in Chatwoot</h1>
<p>Captain AI is an <strong>enterprise feature</strong> in Chatwoot that provides AI-powered capabilities through two main components: <strong>Assistants</strong> and <strong>Copilot</strong>. The system leverages OpenAI's API to provide intelligent conversation support and agent assistance.</p>

<h2>Configuration</h2>
<p>Captain AI requires several configuration settings for OpenAI integration <span class="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs cursor-pointer hover:bg-blue-200">installation_config.yml:164-193</span>. These include API keys, model selection, endpoints, and embedding models for the AI functionality.</p>

<h2>Captain Assistants</h2>
<p>Captain Assistants are AI-powered entities that can interact directly with customers. The core model defines assistants with configurable attributes including name, description, guardrails, and response guidelines <span class="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs cursor-pointer hover:bg-blue-200">assistant.rb:19-43</span>.</p>

<p>Each assistant has relationships with documents, responses, inboxes, messages, scenarios, and copilot threads. Assistants include configurable features like temperature settings, FAQ capabilities, memory features, and product naming.</p>

<p>The assistant chat service handles response generation using OpenAI's API <span class="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs cursor-pointer hover:bg-blue-200">assistant_chat_service.rb:3-26</span>. It incorporates message history and additional context to generate appropriate responses.</p>

<h2>Available Tools</h2>
<p>Captain AI provides various tools that assistants can use to perform specific actions. The available tools include:</p>
<ul>
<li><strong>Add Contact Note</strong>: Add notes to contact profiles</li>
<li><strong>Add Private Note</strong>: Add internal notes to conversations</li>
<li><strong>Update Priority</strong>: Modify conversation priority levels</li>
<li><strong>Add Label to Conversation</strong>: Apply labels to conversations</li>
<li><strong>FAQ Lookup</strong>: Search FAQ responses using semantic similarity</li>
<li><strong>Handoff</strong>: Transfer conversations to human agents</li>
</ul>

<h2>Frontend Integration</h2>
<p>The frontend includes dedicated Vuex store modules for managing Captain AI state, including modules for assistants, documents, responses, inboxes, copilot threads, messages, scenarios, and tools.</p>

<h2>Notes</h2>
<p>Captain AI is designed as a comprehensive AI integration that enhances both automated customer support through assistants and agent productivity through copilot functionality. The system uses OpenAI's language models with configurable parameters and provides extensive tooling capabilities.</p>
`;

function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <DialogSection
          query="Captain and AI Modules in project"
          repository="chatwoot/chatwoot"
          content={sampleContent}
          thoughtProcess="First, I need to understand the structure of Captain AI in Chatwoot. Looking at the codebase, I can see it's an enterprise feature with two main components: Assistants and Copilot. I'll examine the configuration files, models, and services to provide a comprehensive overview."
          prompt={samplePrompt}
          uploadedFiles={sampleUploadedFiles}
          additionalText={sampleAdditionalText}
          files={sampleFiles}
        />

        <DialogSection
          query="Captain and AI Modules in project"
          repository="chatwoot/chatwoot"
          content={sampleContent}
          thoughtProcess="First, I need to understand the structure of Captain AI in Chatwoot. Looking at the codebase, I can see it's an enterprise feature with two main components: Assistants and Copilot. I'll examine the configuration files, models, and services to provide a comprehensive overview."
          files={sampleFiles}
        />
      </div>
    </div>
  );
}

export default App;