import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, HelpCircle } from 'lucide-react';
import { copilotQAs } from '../data/mockData.js';

function Copilot() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      avatar: '🤖',
      text: '你好！我是您的 **AI 供應鏈自主助理 Copilot**。我已穿透 ERP 數據倉儲與合約 RAG 向量資料庫，隨時為您提供主動式預測、地緣政治分析與多層級供應網拓撲風險探查。\n\n您可以使用左側的快速提問，或直接輸入任何關於全球供應鏈的問題：'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (text) => {
    if (!text.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { sender: 'user', avatar: '👤', text: text }]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking and typing
    setTimeout(() => {
      // Check if matches any preset question
      const matchedQA = copilotQAs.find(qa => 
        text.toLowerCase().includes(qa.question.toLowerCase()) || 
        qa.question.toLowerCase().includes(text.toLowerCase())
      );

      let responseText = '';
      if (matchedQA) {
        responseText = matchedQA.answer;
      } else {
        responseText = `### 💡 AI 智能回覆

收到您的提問：『*${text}*』。

目前我已升級為 **Global AI Inventory Control Tower (Ver 1.2)** 全球決策大腦。我建議您點選左側的**全球風險與多層級供應商網絡分析快捷提問**，我可以為您調出以下核心數據：

1. **全球關稅與地緣政治衝擊** (美國加徵12%關稅對我司 STM32 成本的衝擊與 GD32 規避效益分析)
2. **多層級供應網瓶頸探查** (分析 Tier 1 至 Tier 3 的依賴關係，包含日月光封測廠火警中斷與跨國 STO 空運解決方案)
3. **庫存暴增根因分析** (PCB 庫存大增的 Unimicron 提前交貨與產品需求下滑根因)
4. **6個月產銷缺料預測** (核心 MCU 及被動元件動態安全水位與缺料預測)

請直接點擊左側快速提問卡片以獲取高精度的決策報告與圖表！`;
      }

      setMessages(prev => [...prev, { sender: 'bot', avatar: '🤖', text: responseText }]);
      setIsTyping(false);
    }, 1500);
  };

  // Helper to render markdown table and lists in chat
  const formatMarkdownText = (text) => {
    const lines = text.split('\n');
    let inTable = false;
    let tableHeaders = [];
    let tableRows = [];
    const elements = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Headers (e.g., ### title)
      if (line.startsWith('###')) {
        elements.push(<h3 key={`h3-${i}`} style={{ color: '#fff', marginTop: '16px', marginBottom: '8px', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}><Sparkles size={14} style={{ color: 'var(--color-secondary)' }} /> {line.replace('###', '').trim()}</h3>);
        continue;
      }
      if (line.startsWith('####')) {
        elements.push(<h4 key={`h4-${i}`} style={{ color: '#fff', marginTop: '12px', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 700 }}>{line.replace('####', '').trim()}</h4>);
        continue;
      }

      // Bullets
      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        const cleanLine = line.trim().replace(/^[-*]\s*/, '');
        const boldRegex = /\*\*([^*]+)\*\*/g;
        let renderedText = cleanLine;
        
        const boldMatch = boldRegex.exec(cleanLine);
        if (boldMatch) {
          renderedText = (
            <span>
              {cleanLine.split('**')[0]}
              <strong style={{ color: '#fff' }}>{boldMatch[1]}</strong>
              {cleanLine.split('**')[2]}
            </span>
          );
        }

        elements.push(
          <ul key={`ul-${i}`} style={{ paddingLeft: '20px', margin: '4px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <li style={{ marginBottom: '4px' }}>{renderedText}</li>
          </ul>
        );
        continue;
      }

      // Tables
      if (line.startsWith('|') && line.includes('---')) {
        inTable = true;
        continue;
      }

      if (line.startsWith('|') && inTable) {
        const cols = line.split('|').map(c => c.trim()).filter(c => c !== '');
        tableRows.push(cols);
        continue;
      }

      if (line.startsWith('|') && !inTable) {
        const cols = line.split('|').map(c => c.trim()).filter(c => c !== '');
        tableHeaders = cols;
        inTable = true;
        continue;
      }

      if (!line.startsWith('|') && inTable) {
        elements.push(
          <div key={`table-wrapper-${i}`} className="table-container" style={{ margin: '16px 0' }}>
            <table className="premium-table" style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <thead>
                <tr>
                  {tableHeaders.map((h, idx) => <th key={`th-${idx}`} style={{ padding: '8px 10px' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, rIdx) => (
                  <tr key={`tr-${rIdx}`}>
                    {row.map((val, cIdx) => (
                      <td key={`td-${cIdx}`} style={{ padding: '8px 10px', color: val.includes('HIGH') || val.includes('Critical') ? 'var(--risk-high)' : val.includes('MEDIUM') || val.includes('Warning') ? 'var(--risk-medium)' : 'var(--text-primary)', fontWeight: val.includes('RISK') || val.includes('Critical') || val.includes('Warning') ? 700 : 500 }}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        inTable = false;
        tableHeaders = [];
        tableRows = [];
      }

      // Regular paragraph
      if (line.trim() !== '') {
        let formattedLine = line;
        
        if (line.includes('**')) {
          const parts = line.split('**');
          formattedLine = parts.map((part, index) => 
            index % 2 === 1 ? <strong key={index} style={{ color: '#fff' }}>{part}</strong> : part
          );
        }

        elements.push(<p key={`p-${i}`} style={{ fontSize: '0.85rem', lineHeight: 1.6, margin: '8px 0', color: '#d1d5db' }}>{formattedLine}</p>);
      }
    }

    return elements;
  };

  return (
    <>
      {/* Top Header */}
      <div className="top-header">
        <div className="header-title-container">
          <h1 className="glow-text" style={{ fontSize: '2.2rem', fontWeight: 800 }}>AI Copilot 智能助理</h1>
          <p className="header-subtitle">Global Geopolitics, Tariff Rules, and Multi-tier Network Intelligence</p>
        </div>
      </div>

      <div className="agent-room-container" style={{ gridTemplateColumns: '350px 1fr' }}>
        {/* Left Side: Preset Questions */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
            全球供應鏈與風險分析快捷提問
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {copilotQAs.map(qa => (
              <div 
                key={qa.id}
                className="scenario-card"
                onClick={() => handleSendMessage(qa.question)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px' }}
              >
                <HelpCircle size={18} style={{ color: 'var(--color-secondary)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>
                  {qa.question}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '6px' }}>
              <Sparkles size={12} />
              <span>全球風險告警推播</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              偵測到 <strong>美國加徵關鍵 MCU 關稅 12%</strong>。建議點選第四個提問，評估此事件對我司採購成本的衝擊與替代策略。
            </p>
          </div>
        </div>

        {/* Right Side: Chat Window */}
        <div className="chat-window">
          {/* Chat Messages */}
          <div className="chat-messages" style={{ background: 'rgba(7, 8, 14, 0.2)' }}>
            {messages.map((msg, index) => (
              <div 
                key={index}
                className={`message-wrapper ${msg.sender === 'user' ? 'user' : 'agent'}`}
                style={{ maxWidth: '90%' }}
              >
                <div className="message-avatar" style={{ background: msg.sender === 'user' ? 'var(--color-primary)' : '#202538' }}>
                  {msg.avatar}
                </div>
                <div className="message-bubble-container">
                  <span className="message-sender-name">
                    {msg.sender === 'user' ? '您' : 'AI Copilot'}
                  </span>
                  <div 
                    className="message-bubble"
                    style={{
                      background: msg.sender === 'user' ? 'var(--color-primary)' : 'var(--bg-card)',
                      border: msg.sender === 'user' ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid var(--border-light)',
                      padding: '16px 20px'
                    }}
                  >
                    {msg.sender === 'user' ? msg.text : formatMarkdownText(msg.text)}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message-wrapper agent">
                <div className="message-avatar" style={{ background: '#202538', animation: 'pulse-icon 1.5s infinite' }}>
                  🤖
                </div>
                <div className="message-bubble-container">
                  <span className="message-sender-name">AI Copilot 正在深度解析中...</span>
                  <div className="message-bubble" style={{ padding: '8px 16px' }}>
                    <div className="typing-indicator">
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            style={{
              padding: '16px 24px',
              background: 'rgba(11, 13, 22, 0.8)',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              gap: '12px'
            }}
          >
            <input 
              type="text"
              placeholder="請輸入關於關稅風險、多層級網絡、或是全球供應鏈斷鏈的任何問題..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping}
              style={{
                flexGrow: 1,
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-light)',
                borderRadius: '10px',
                padding: '12px 18px',
                fontSize: '0.85rem',
                color: '#fff',
                outline: 'none',
                transition: 'border 0.15s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
            />
            <button 
              type="submit" 
              className="btn"
              disabled={!inputText.trim() || isTyping}
              style={{ padding: '0 20px', borderRadius: '10px' }}
            >
              <Send size={16} />
              <span>發送</span>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Copilot;
