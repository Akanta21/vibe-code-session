'use client'

import { useState } from 'react'

export default function AgendaSection() {
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadPDF = async () => {
    setIsDownloading(true)
    
    try {
      // Create a printable version
      const printWindow = window.open('', '_blank')
      if (!printWindow) return
      
      const agendaHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Vibe Coding Event - Workshop Agenda</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 40px 20px;
              background: white;
            }
            h1 { 
              color: #8b5cf6; 
              font-size: 2.5rem; 
              margin-bottom: 10px; 
              text-align: center;
              font-weight: 800;
            }
            h2 { 
              color: #3b82f6; 
              font-size: 1.5rem; 
              margin: 30px 0 15px 0; 
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 5px;
            }
            h3 { 
              color: #6366f1; 
              font-size: 1.2rem; 
              margin: 20px 0 10px 0; 
            }
            p, li { 
              margin-bottom: 8px; 
              color: #4b5563;
            }
            ul { 
              padding-left: 20px; 
              margin-bottom: 15px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0;
              border: 1px solid #d1d5db;
            }
            th, td { 
              padding: 12px; 
              text-align: left; 
              border-bottom: 1px solid #d1d5db;
            }
            th { 
              background-color: #f3f4f6; 
              font-weight: 600;
              color: #374151;
            }
            .goal-item { 
              background: #f0f9ff; 
              padding: 15px; 
              margin: 10px 0; 
              border-radius: 8px; 
              border-left: 4px solid #3b82f6;
            }
            .step-item { 
              background: #faf5ff; 
              padding: 15px; 
              margin: 15px 0; 
              border-radius: 8px; 
              border-left: 4px solid #8b5cf6;
            }
            .tip-box { 
              background: #ecfdf5; 
              padding: 15px; 
              border-radius: 8px; 
              border: 1px solid #10b981; 
              margin: 15px 0;
            }
            .header { 
              text-align: center; 
              margin-bottom: 40px; 
              padding-bottom: 20px;
              border-bottom: 3px solid #8b5cf6;
            }
            .subtitle { 
              color: #6b7280; 
              font-size: 1.1rem; 
              margin-top: 10px;
            }
            a { 
              color: #3b82f6; 
              text-decoration: none;
            }
            a:hover { 
              text-decoration: underline;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 0.9rem;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎨 VIBE CODING WORKSHOP</h1>
            <p class="subtitle">Turn Your Idea Into a Live Vibe — Fast, Fun, and Real</p>
            <p style="color: #8b5cf6; font-weight: 600; margin-top: 15px;">December 14, 2024 | Singapore</p>
          </div>

          <h2>🎯 Today's Goals</h2>
          <div class="goal-item">
            <strong>✨ Spark creativity</strong><br>
            Unlock your innovative potential and think outside the box
          </div>
          <div class="goal-item">
            <strong>🛠️ Build a prototype using Lovable</strong><br>
            Transform your ideas into working applications quickly
          </div>
          <div class="goal-item">
            <strong>🚀 Launch it live using Cloudflare</strong><br>
            Deploy your creation and make it accessible to the world
          </div>
          <div class="goal-item">
            <strong>💡 Leave inspired to continue your vibe coding journey</strong><br>
            Build momentum and confidence for future projects
          </div>

          <h2>🛠️ Tools We'll Use</h2>
          <table>
            <tr>
              <th>Tool</th>
              <th>Purpose</th>
              <th>Links</th>
            </tr>
            <tr>
              <td><strong>Lovable</strong></td>
              <td>Turn your ideas into working apps quickly</td>
              <td><a href="https://lovable.ai">lovable.ai</a></td>
            </tr>
            <tr>
              <td><strong>Cloudflare</strong></td>
              <td>Host and productize your prototype</td>
              <td><a href="https://developers.cloudflare.com">developers.cloudflare.com</a></td>
            </tr>
          </table>

          <div class="tip-box">
            <strong>💡 Pro Tip:</strong> Don't overthink – focus on getting something working fast!
          </div>

          <h2>📋 Step-by-Step Workflow</h2>

          <div class="step-item">
            <h3>1. Ideate Your Vibe (15 min)</h3>
            <ul>
              <li>Sketch or write your app idea</li>
              <li>Keep it fun, simple, or quirky</li>
              <li><strong>Example prompts:</strong> playlist generator, snack tracker, quick scheduler</li>
            </ul>
          </div>

          <div class="step-item">
            <h3>2. Prototype in Lovable (30–40 min)</h3>
            <ul>
              <li>Enter your idea into Lovable and watch it come alive</li>
              <li>Iterate quickly – done is better than perfect</li>
              <li>Experiment with features and design elements</li>
            </ul>
          </div>

          <div class="step-item">
            <h3>3. Deploy on Cloudflare (15 min)</h3>
            <ul>
              <li>Host your prototype online so it's live</li>
              <li>Feel the thrill of seeing your vibe in the wild</li>
              <li>Share your live link with others</li>
            </ul>
          </div>

          <div class="step-item">
            <h3>4. Showcase & Celebrate (40 min)</h3>
            <ul>
              <li>Present your idea, prototype, and live deployment</li>
              <li>Share discoveries, surprises, and creative hacks</li>
              <li>Learn from others' approaches and solutions</li>
            </ul>
          </div>

          <h2>🎯 Tips for Success</h2>
          <ul>
            <li><strong>Pair tech + non-tech participants</strong> for best results</li>
            <li><strong>Experiment freely</strong> – mistakes are part of the vibe</li>
            <li><strong>Ask facilitators</strong> for quick tips or help when stuck</li>
            <li><strong>Focus on experience + learning,</strong> not perfection</li>
          </ul>

          <h2>📚 Resources & Next Steps</h2>
          <p><strong>Lovable Community:</strong> Explore more templates & tips → <a href="https://lovable.ai/community">lovable.ai/community</a></p>
          <p><strong>Cloudflare Developer Docs:</strong> Deepen your productization skills → <a href="https://developers.cloudflare.com">developers.cloudflare.com</a></p>
          
          <div class="tip-box">
            <strong>🏆 Suggested Challenge:</strong> Build one vibe project per week and share it with friends or online!
          </div>

          <div class="footer">
            <p>Organized by IndoTechSg • Sponsored by Cloudflare Singapore • Powered by Lovable</p>
            <p>© 2024 Vibe Coding Event | For more info: <a href="https://indotech.sg">indotech.sg</a></p>
          </div>
        </body>
        </html>
      `
      
      printWindow.document.write(agendaHTML)
      printWindow.document.close()
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 250)
      }
      
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    } finally {
      setTimeout(() => setIsDownloading(false), 1000)
    }
  }

  return (
    <section className="relative z-10 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            📋 Workshop Agenda
          </h2>
          <p className="text-xl text-gray-300 mb-6">
            Your complete guide to building and launching in one day
          </p>
        </div>

        {/* Goals */}
        <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 mb-8">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
            <span className="text-2xl mr-3">🎯</span>
            Today's Goals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
              <div className="flex items-center text-blue-300 font-medium mb-2">
                <span className="mr-2">✨</span>Spark creativity
              </div>
            </div>
            <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/30">
              <div className="flex items-center text-purple-300 font-medium mb-2">
                <span className="mr-2">🛠️</span>Build a prototype using Lovable
              </div>
            </div>
            <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30">
              <div className="flex items-center text-green-300 font-medium mb-2">
                <span className="mr-2">🚀</span>Launch it live using Cloudflare
              </div>
            </div>
            <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-500/30">
              <div className="flex items-center text-amber-300 font-medium mb-2">
                <span className="mr-2">💡</span>Leave inspired to continue
              </div>
            </div>
          </div>
        </div>

        {/* Tools */}
        <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 mb-8">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
            <span className="text-2xl mr-3">🛠️</span>
            Tools We'll Use
          </h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
              <div>
                <div className="text-purple-300 font-semibold text-lg">Lovable</div>
                <div className="text-gray-300 text-sm">Turn your ideas into working apps quickly</div>
              </div>
              <a 
                href="https://lovable.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors text-sm mt-2 sm:mt-0"
              >
                lovable.ai →
              </a>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
              <div>
                <div className="text-blue-300 font-semibold text-lg">Cloudflare</div>
                <div className="text-gray-300 text-sm">Host and productize your prototype</div>
              </div>
              <a 
                href="https://developers.cloudflare.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors text-sm mt-2 sm:mt-0"
              >
                developers.cloudflare.com →
              </a>
            </div>
          </div>
          <div className="mt-4 p-3 bg-green-900/20 rounded-lg border border-green-500/30">
            <p className="text-green-300 text-sm flex items-center">
              <span className="mr-2">💡</span>
              <strong>Pro Tip:</strong> Don't overthink – focus on getting something working fast!
            </p>
          </div>
        </div>

        {/* Workflow */}
        <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="text-2xl mr-3">📋</span>
            Step-by-Step Workflow
          </h3>
          <div className="space-y-6">
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="text-lg font-semibold text-white mb-2">1. Ideate Your Vibe (15 min)</h4>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Sketch or write your app idea</li>
                <li>• Keep it fun, simple, or quirky</li>
                <li>• <strong>Example prompts:</strong> playlist generator, snack tracker, quick scheduler</li>
              </ul>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="text-lg font-semibold text-white mb-2">2. Prototype in Lovable (30–40 min)</h4>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Enter your idea into Lovable and watch it come alive</li>
                <li>• Iterate quickly – done is better than perfect</li>
              </ul>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="text-lg font-semibold text-white mb-2">3. Deploy on Cloudflare (15 min)</h4>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Host your prototype online so it's live</li>
                <li>• Feel the thrill of seeing your vibe in the wild</li>
              </ul>
            </div>
            <div className="border-l-4 border-amber-500 pl-4">
              <h4 className="text-lg font-semibold text-white mb-2">4. Showcase & Celebrate (40 min)</h4>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Present your idea, prototype, and live deployment</li>
                <li>• Share discoveries, surprises, and creative hacks</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center mt-12">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
            <button
              onClick={downloadPDF}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 btn-primary"
              style={{
                background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                border: 'none',
                cursor: isDownloading ? 'not-allowed' : 'pointer',
                color: 'white',
                opacity: isDownloading ? 0.7 : 1,
              }}
            >
              <span className="text-xl">📄</span>
              {isDownloading ? 'Preparing PDF...' : 'Download Agenda'}
            </button>
            <button
              className="inline-flex items-center gap-2 btn-primary glow"
              style={{
                background: 'linear-gradient(to right, #059669, #10b981)',
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                border: 'none',
                cursor: 'pointer',
                color: 'white',
              }}
            >
              <span className="text-xl">🚀</span>
              Register Now - $10
            </button>
          </div>
          <p className="text-gray-400 text-sm">
            Get your agenda & secure your spot for the ultimate coding experience
          </p>
        </div>
      </div>
    </section>
  )
}