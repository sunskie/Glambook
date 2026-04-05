// Frontend/src/pages/LandingPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Search, Calendar, PartyPopper,
  Award, TrendingUp, Lock, Play, Globe, MessageCircle, Mail
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f6f8'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 80px',
        borderBottom: '1px solid rgba(91, 98, 179, 0.1)',
        backgroundColor: 'rgba(245, 246, 248, 0.95)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#5B62B3'
        }}>
          <Sparkles size={32} />
          <h2 style={{
            fontSize: '24px',
            fontWeight: 900,
            fontFamily: 'Syne, sans-serif',
            margin: 0
          }}>
            GlamBook
          </h2>
        </div>

        <nav style={{
          display: 'flex',
          gap: '48px',
          alignItems: 'center'
        }}>
          <a href="#services" style={{
            color: '#475569',
            fontSize: '14px',
            fontWeight: 500,
            textDecoration: 'none',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            Services
          </a>
          <a href="#about" style={{
            color: '#475569',
            fontSize: '14px',
            fontWeight: 500,
            textDecoration: 'none',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            Academy
          </a>
          <a href="#features" style={{
            color: '#475569',
            fontSize: '14px',
            fontWeight: 500,
            textDecoration: 'none',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            Our Story
          </a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '10px 24px',
              backgroundColor: '#5B62B3',
              color: 'white',
              border: 'none',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', minHeight: '85vh' }}>
          {/* Left Side - Content */}
          <div style={{
            width: '50%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '48px 80px',
            backgroundColor: '#f5f6f8'
          }}>
            <div style={{ maxWidth: '540px' }}>
              <span style={{
                color: '#5B62B3',
                fontWeight: 700,
                letterSpacing: '0.1em',
                fontSize: '12px',
                textTransform: 'uppercase',
                marginBottom: '16px',
                display: 'block',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                The Future of Beauty
              </span>

              <h1 style={{
                fontSize: '56px',
                fontWeight: 900,
                lineHeight: '1.1',
                marginBottom: '32px',
                fontFamily: 'Syne, sans-serif',
                margin: '0 0 32px 0',
                color: '#111111'
              }}>
                Elevate Your <br />
                <span style={{ color: '#5B62B3', fontStyle: 'italic' }}>Aesthetic</span> Journey
              </h1>

              <p style={{
                color: '#64748b',
                fontSize: '18px',
                lineHeight: '1.6',
                marginBottom: '40px',
                maxWidth: '480px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                A premier ecosystem where high-fashion artistry meets professional education. 
                Book elite talent or master the craft.
              </p>

              <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '48px'
              }}>
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    flex: 1,
                    minWidth: '180px',
                    padding: '16px 32px',
                    backgroundColor: '#5B62B3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 10px 40px rgba(91, 98, 179, 0.2)',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
                  Book a Service
                </button>

                <button
                  onClick={() => navigate('/register')}
                  style={{
                    flex: 1,
                    minWidth: '180px',
                    padding: '16px 32px',
                    backgroundColor: 'transparent',
                    color: '#5B62B3',
                    border: '2px solid rgba(91, 98, 179, 0.3)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
                  Learn a Skill
                </button>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', marginLeft: '-12px' }}>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: '2px solid #f5f6f8',
                        backgroundColor: '#cbd5e1',
                        marginLeft: '-12px'
                      }}
                    />
                  ))}
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  fontWeight: 500,
                  margin: 0,
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Joined by 12k+ beauty enthusiasts
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Gradient */}
          <div style={{
            width: '50%',
            position: 'relative',
            minHeight: '500px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              fontSize: '120px',
              color: 'rgba(255, 255, 255, 0.2)',
              fontFamily: 'Syne, serif',
              fontWeight: 900
            }}>
              BEAUTY
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="about" style={{
        padding: '96px 0',
        backgroundColor: 'rgba(91, 98, 179, 0.05)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 900,
            marginBottom: '64px',
            fontFamily: 'Syne, sans-serif',
            color: '#111111'
          }}>
            Your Journey to Glamour
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '48px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'white',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#5B62B3',
                marginBottom: '24px'
              }}>
                <Search size={36} />
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                marginBottom: '12px',
                fontFamily: 'Syne, sans-serif',
                color: '#111111'
              }}>
                Explore & Select
              </h3>
              <p style={{
                color: '#64748b',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Browse through a curated list of elite beauty specialists or academy courses.
              </p>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'white',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#5B62B3',
                marginBottom: '24px'
              }}>
                <Calendar size={36} />
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                marginBottom: '12px',
                fontFamily: 'Syne, sans-serif',
                color: '#111111'
              }}>
                Instant Booking
              </h3>
              <p style={{
                color: '#64748b',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Secure your appointment or enrollment with our seamless checkout system.
              </p>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'white',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#5B62B3',
                marginBottom: '24px'
              }}>
                <PartyPopper size={36} />
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                marginBottom: '12px',
                fontFamily: 'Syne, sans-serif',
                color: '#111111'
              }}>
                Experience Excellence
              </h3>
              <p style={{
                color: '#64748b',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Receive world-class service or start your path to professional mastery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{
        padding: '96px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '64px'
          }}>
            <div style={{ maxWidth: '600px' }}>
              <h2 style={{
                fontSize: '36px',
                fontWeight: 900,
                marginBottom: '16px',
                fontFamily: 'Syne, sans-serif',
                color: '#111111'
              }}>
                Modern Tools for Modern Beauty
              </h2>
              <p style={{
                color: '#64748b',
                fontSize: '18px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Every detail crafted for your convenience and career growth.
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px'
          }}>
            <div style={{
              padding: '32px',
              borderRadius: '16px',
              backgroundColor: 'white',
              border: '1px solid rgba(91, 98, 179, 0.1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                backgroundColor: 'rgba(91, 98, 179, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#5B62B3',
                marginBottom: '24px'
              }}>
                <Award size={24} />
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                marginBottom: '16px',
                fontFamily: 'Syne, sans-serif',
                color: '#111111'
              }}>
                Digital Certificates
              </h3>
              <p style={{
                color: '#64748b',
                lineHeight: '1.6',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Instantly verifiable certifications upon course completion, ready for your portfolio.
              </p>
            </div>

            <div style={{
              padding: '32px',
              borderRadius: '16px',
              backgroundColor: 'white',
              border: '1px solid rgba(91, 98, 179, 0.1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                backgroundColor: 'rgba(91, 98, 179, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#5B62B3',
                marginBottom: '24px'
              }}>
                <TrendingUp size={24} />
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                marginBottom: '16px',
                fontFamily: 'Syne, sans-serif',
                color: '#111111'
              }}>
                Progress Tracking
              </h3>
              <p style={{
                color: '#64748b',
                lineHeight: '1.6',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Monitor your skill development with interactive modules and performance analytics.
              </p>
            </div>

            <div style={{
              padding: '32px',
              borderRadius: '16px',
              backgroundColor: 'white',
              border: '1px solid rgba(91, 98, 179, 0.1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                backgroundColor: 'rgba(91, 98, 179, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#5B62B3',
                marginBottom: '24px'
              }}>
                <Lock size={24} />
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                marginBottom: '16px',
                fontFamily: 'Syne, sans-serif',
                color: '#111111'
              }}>
                Secure Payments
              </h3>
              <p style={{
                color: '#64748b',
                lineHeight: '1.6',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Top-tier encryption ensuring your transactions and data are always protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '96px 24px',
        backgroundColor: '#1e293b',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '80px'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'inline-block',
                padding: '4px 16px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(91, 98, 179, 0.2)',
                color: '#5B62B3',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '24px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Why Professionals Choose Us
              </div>

              <h2 style={{
                fontSize: '48px',
                fontWeight: 900,
                marginBottom: '32px',
                lineHeight: '1.2',
                fontFamily: 'Syne, sans-serif'
              }}>
                The Industry's Most Trusted Ecosystem
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: '1px solid rgba(91, 98, 179, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 700,
                    color: '#5B62B3',
                    flexShrink: 0
                  }}>
                    01
                  </div>
                  <div>
                    <h4 style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      marginBottom: '8px',
                      fontFamily: 'Syne, sans-serif'
                    }}>
                      Integrated Platform
                    </h4>
                    <p style={{
                      color: '#94a3b8',
                      fontSize: '14px',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      Everything from portfolio management to client bookings and skill upgrades in one place.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '24px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: '1px solid rgba(91, 98, 179, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 700,
                    color: '#5B62B3',
                    flexShrink: 0
                  }}>
                    02
                  </div>
                  <div>
                    <h4 style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      marginBottom: '8px',
                      fontFamily: 'Syne, sans-serif'
                    }}>
                      Elite Network
                    </h4>
                    <p style={{
                      color: '#94a3b8',
                      fontSize: '14px',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      Connect with established beauty moguls and rising stars in the high-fashion industry.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '24px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: '1px solid rgba(91, 98, 179, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 700,
                    color: '#5B62B3',
                    flexShrink: 0
                  }}>
                    03
                  </div>
                  <div>
                    <h4 style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      marginBottom: '8px',
                      fontFamily: 'Syne, sans-serif'
                    }}>
                      Exclusive Tools
                    </h4>
                    <p style={{
                      color: '#94a3b8',
                      fontSize: '14px',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      Access proprietary business management tools specifically designed for beauty entrepreneurs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{
                backgroundColor: '#334155',
                padding: '16px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  aspectRatio: '16/9',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <Play size={64} />
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#5B62B3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Play size={20} />
                    </div>
                    <div>
                      <p style={{
                        fontWeight: 700,
                        fontSize: '14px',
                        margin: 0,
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        GlamBook Masterclass
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#94a3b8',
                        fontStyle: 'italic',
                        margin: 0,
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        "The Art of Transformation"
                      </p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#5B62B3',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    LIVE NOW
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '80px 0',
        backgroundColor: '#f5f6f8',
        borderTop: '1px solid rgba(91, 98, 179, 0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '64px'
          }}>
            <h2 style={{
              fontSize: '48px',
              fontWeight: 900,
              marginBottom: '32px',
              fontFamily: 'Syne, sans-serif',
              color: '#111111'
            }}>
              Join the Movement
            </h2>
            <p style={{
              color: '#64748b',
              fontSize: '18px',
              marginBottom: '40px',
              maxWidth: '600px',
              margin: '0 auto 40px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Whether you're seeking perfection or aiming to provide it, GlamBook is your canvas. 
              Join our exclusive community today.
            </p>
            <button
              onClick={() => navigate('/register')}
              style={{
                backgroundColor: '#5B62B3',
                color: 'white',
                padding: '20px 48px',
                borderRadius: '9999px',
                border: 'none',
                fontWeight: 700,
                fontSize: '20px',
                boxShadow: '0 20px 60px rgba(91, 98, 179, 0.4)',
                cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              Start Your Transformation
            </button>
          </div>

          <hr style={{
            border: 'none',
            borderTop: '1px solid rgba(91, 98, 179, 0.1)',
            marginBottom: '64px'
          }} />

          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: '40px'
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#5B62B3',
                marginBottom: '24px'
              }}>
                <Sparkles size={32} />
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  fontFamily: 'Syne, sans-serif',
                  margin: 0
                }}>
                  GlamBook
                </h2>
              </div>
              <p style={{
                color: '#64748b',
                fontSize: '14px',
                maxWidth: '300px',
                marginBottom: '24px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                The luxury standard for beauty service booking and professional academy training worldwide.
              </p>
              <div style={{ display: 'flex', gap: '16px' }}>
                <a href="#" style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(91, 98, 179, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#5B62B3',
                  textDecoration: 'none'
                }}>
                  <Globe size={20} />
                </a>
                <a href="#" style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(91, 98, 179, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#5B62B3',
                  textDecoration: 'none'
                }}>
                  <MessageCircle size={20} />
                </a>
                <a href="#" style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(91, 98, 179, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#5B62B3',
                  textDecoration: 'none'
                }}>
                  <Mail size={20} />
                </a>
              </div>
            </div>

            <div>
              <h4 style={{
                fontWeight: 700,
                marginBottom: '24px',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#94a3b8',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Explore
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <li>
                  <a href="#" style={{
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    Find Artists
                  </a>
                </li>
                <li>
                  <a href="#" style={{
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    Browse Courses
                  </a>
                </li>
                <li>
                  <a href="#" style={{
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    Upcoming Workshops
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 style={{
                fontWeight: 700,
                marginBottom: '24px',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#94a3b8',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Academy
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <li>
                  <a href="#" style={{
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    Certification
                  </a>
                </li>
                <li>
                  <a href="#" style={{
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    Scholarships
                  </a>
                </li>
                <li>
                  <a href="#" style={{
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 style={{
                fontWeight: 700,
                marginBottom: '24px',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#94a3b8',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Support
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <li>
                  <a href="#" style={{
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" style={{
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" style={{
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div style={{
            marginTop: '80px',
            paddingTop: '32px',
            borderTop: '1px solid rgba(91, 98, 179, 0.05)',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '12px',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            © 2024 GlamBook International. All rights reserved. Designed for the elite.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;