# Booking Web - Hotel Booking Platform

A full-stack hotel booking platform built with Node.js and Express, supporting multi-role access (User, Hotel Owner, Admin), multiple payment gateways, and OAuth authentication.

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | - | Runtime environment |
| **Express** | 5.1.0 | Web framework |
| **MongoDB** | - | NoSQL database |
| **Mongoose** | 8.18.2 | MongoDB ODM |

### Authentication & Security
| Technology | Version | Purpose |
|---|---|---|
| **JSON Web Token** | 9.0.2 | Access & refresh tokens |
| **Passport.js** | 0.7.0 | Authentication middleware |
| **passport-google-oauth20** | 2.0.0 | Google OAuth 2.0 login |
| **passport-facebook** | 3.0.0 | Facebook OAuth login |
| **bcrypt** | 6.0.0 | Password hashing |

### Payment Gateways
| Integration | Purpose |
|---|---|
| **VNPay** | Vietnamese payment gateway |
| **Momo** | Vietnamese e-wallet payment |

### File Storage & Media
| Technology | Version | Purpose |
|---|---|---|
| **MinIO** | 8.0.6 | Self-hosted S3-compatible object storage |
| **Cloudinary** | 1.41.3 | Cloud image storage & CDN |
| **Multer** | 2.0.2 | Multipart file upload handling |
| **Sharp** | 0.34.5 | Image processing & optimization |

### Services & Integrations
| Technology | Version | Purpose |
|---|---|---|
| **Nodemailer** | 7.0.6 | Transactional emails (Gmail SMTP) |
| **Node-cron** | 4.2.1 | Scheduled tasks (reminders, auto-status updates) |
| **Axios** | 1.8.4 | HTTP client for external API calls |
| **SerpAPI** | 2.2.1 | Search integration |

### API & Documentation
| Technology | Version | Purpose |
|---|---|---|
| **Swagger UI Express** | 5.0.1 | Interactive API docs at `/docs` |
| **swagger-autogen** | 2.23.7 | Auto-generate Swagger spec |
| **swagger-jsdoc** | 6.2.8 | JSDoc-based API documentation |

### Utilities
| Technology | Version | Purpose |
|---|---|---|
| **Moment.js** | 2.30.1 | Date & time formatting |
| **Slugify** | 1.6.6 | URL slug generation |
| **GeoJSON** | 0.5.0 | Geospatial data support |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **Cookie-parser** | 1.4.7 | Cookie handling |

### Frontend
| Technology | Purpose |
|---|---|
| **HTML / JavaScript** | Multi-page frontend (no SPA framework) |
| **Tailwind CSS** | Utility-first CSS styling |
| **Express-Handlebars** | Server-side template rendering |
| **Google Material Symbols** | Icon library |
| **Preline UI** | Tailwind UI component library |

### DevOps & Infrastructure
| Technology | Purpose |
|---|---|
| **Docker Compose** | Container orchestration for MinIO |
| **Nodemon** | Auto-restart during development |

---

## Project Structure

```
├── FE/                         # Static frontend pages
│   ├── Auth/                   # Login, Register, Password Reset
│   ├── User/                   # Profile, Change Password
│   ├── Dashboard/              # Admin & Hotel Owner dashboards
│   ├── Error/                  # 401, 403 error pages
│   ├── index.html              # Homepage
│   └── script.js               # Frontend scripts
│
├── src/
│   ├── app/
│   │   ├── controllers/        # Request handlers
│   │   └── models/             # Mongoose schemas
│   ├── config/                 # DB, MinIO configuration
│   ├── middlewares/            # Auth, upload, role-check middlewares
│   ├── resources/views/        # Handlebars templates
│   ├── routes/                 # API route definitions
│   ├── scripts/                # Utility scripts
│   ├── services/               # Business logic (payment, email, storage)
│   └── app.js                  # Express app entry point
│
├── docker-compose.yml          # MinIO container setup
└── package.json
```

---

## Database Models

- **User** — Supports local & federated (OAuth) credentials
- **Hotel** — Hotel listings with geolocation
- **RoomType** — Room category definitions
- **RoomInstance** — Individual physical rooms
- **Booking** — Reservation records
- **Payment** — Payment transactions
- **Review** — User reviews for hotels
- **Coupon** — Discount coupon system
- **Notification** — In-app notifications
- **City** — City metadata for search/filtering

---

## User Roles

| Role | Access |
|---|---|
| `user` | Browse hotels, book rooms, write reviews |
| `hotel_owner` | Manage hotel listings, rooms, and bookings |
| `admin` | Full platform administration |

---

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/booking-hotel

# JWT Secrets
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
RESET_PASSWORD_SECRET=
EMAIL_VERIFY_SECRET=

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

# Email (Gmail SMTP)
EMAIL_USER=
EMAIL_PASS=

# VNPay
VNP_TMNCODE=
VNP_HASHSECRET=
VNP_URL=

# Momo
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=

# MinIO
MINIO_ENDPOINT=
MINIO_PORT=

# Cloudinary
CLOUDINARY_NAME=
CLOUDINARY_KEY=
CLOUDINARY_SECRET=
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start MinIO (Docker required)
docker-compose up -d

# Run in development
npm run dev

# Run in production
npm start
```

API documentation is available at `http://localhost:3000/docs` after starting the server.
