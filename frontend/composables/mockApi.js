import { ref } from 'vue';

export const useSamplePrompt = () => {
  const samplePrompt = ref(`Captain and AI Modules in project`);
  return { samplePrompt };
};

export const useSampleUploadedFiles = () => {
  const sampleUploadedFiles = ref([
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
  ]);
  return { sampleUploadedFiles };
};

export const useSampleAdditionalText = () => {
  const sampleAdditionalText = ref(`
    <p>This analysis was performed on the latest version of the Chatwoot codebase (commit: 8606aa13). The Captain AI system represents a significant enhancement to the platform's automation capabilities.</p>
    <p><strong>Key findings:</strong></p>
    <ul>
    <li>Modular architecture allows for easy extension</li>
    <li>Comprehensive tool system for various operations</li>
    <li>Robust error handling and logging mechanisms</li>
    </ul>
  `);
  return { sampleAdditionalText };
};

export const useSampleFiles = () => {
  const sampleFiles = ref([
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
# role:              The role for the additional_message (defaults to 'user').
#
# NOTE: Parameters are provided as keyword arguments to improve clarity and avoid relying on
# positional ordering.
def generate_response(additional_message: nil, message_history: [], role: 'user')
  @messages += message_history
  @messages << { role: role, content: additional_message } if additional_message.present?
  request_chat_completion
end`
    }
  ]);
  return { sampleFiles };
};


export const useSampleAiResponse = async () => {
  const sampleResponse = ref(null);
  try {
    const response = await fetch('http://localhost:8080/api/airesponse');
    const data = await response.json();
    sampleResponse.value = data;
  } catch (error) {
    console.error('Error fetching AI response:', error);
  }
  return { sampleResponse };
};
