// // const jwt = require("jsonwebtoken");
// // const User = require("../models/User");

// // const authenticate = async (req, res, next) => {
// //   try {
// //     const authHeader = req.headers.authorization || "";
// //     const token =
// //       authHeader.startsWith("Bearer ") ? authHeader.slice(7) : req.cookies?.adminToken;

// //     if (!token) return res.status(401).json({ message: "Missing token" });

// //     const payload = jwt.verify(token, process.env.JWT_SECRET);
// //     const user = await User.findById(payload.id);
// //     if (!user) return res.status(401).json({ message: "Invalid token" });

// //     req.user = user; // attach for later
// //     next();
// //   } catch (err) {
// //     console.error("Auth error:", err);
// //     return res.status(401).json({ message: "Unauthorized" });
// //   }
// // };

// // const isAdmin = (req, res, next) => {
// //   if (!req.user) return res.status(401).json({ message: "Unauthorized" });
// //   if (req.user.role !== "admin")
// //     return res.status(403).json({ message: "Forbidden: admin only" });
// //   next();
// // };

// // module.exports = { authenticate, isAdmin };



// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// const authenticate = async (req, res, next) => {
//   try {
//     // Check for token in multiple locations
//     const authHeader = req.headers.authorization || "";
//     const token = 
//       authHeader.startsWith("Bearer ") ? authHeader.slice(7) : 
//       req.cookies?.adminToken || 
//       req.cookies?.managerToken ||
//       req.query?.token;

//     if (!token) {
//       return res.status(401).json({ 
//         success: false,
//         message: "Authentication required. Please log in." 
//       });
//     }

//     const payload = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(payload.id).select("-password");
    
//     if (!user) {
//       return res.status(401).json({ 
//         success: false,
//         message: "Invalid token. User not found." 
//       });
//     }

//     if (!user.isActive) {
//       return res.status(401).json({ 
//         success: false,
//         message: "Account is deactivated. Please contact administrator." 
//       });
//     }

//     req.user = user; // attach user object for later use
//     next();
//   } catch (err) {
//     console.error("Auth error:", err);
    
//     if (err.name === "TokenExpiredError") {
//       return res.status(401).json({ 
//         success: false,
//         message: "Token expired. Please log in again." 
//       });
//     }
    
//     if (err.name === "JsonWebTokenError") {
//       return res.status(401).json({ 
//         success: false,
//         message: "Invalid token. Please log in again." 
//       });
//     }
    
//     return res.status(500).json({ 
//       success: false,
//       message: "Authentication server error." 
//     });
//   }
// };

// const isAdmin = (req, res, next) => {
//   if (!req.user) {
//     return res.status(401).json({ 
//       success: false,
//       message: "Authentication required." 
//     });
//   }
  
//   if (req.user.role !== "admin") {
//     return res.status(403).json({ 
//       success: false,
//       message: "Access denied. Admin privileges required." 
//     });
//   }
  
//   next();
// };

// const isManager = (req, res, next) => {
//   if (!req.user) {
//     return res.status(401).json({ 
//       success: false,
//       message: "Authentication required." 
//     });
//   }
  
//   if (req.user.role !== "manager" && req.user.role !== "admin") {
//     return res.status(403).json({ 
//       success: false,
//       message: "Access denied. Manager or Admin privileges required." 
//     });
//   }
  
//   next();
// };

// const isManagerOrOwner = (req, res, next) => {
//   if (!req.user) {
//     return res.status(401).json({ 
//       success: false,
//       message: "Authentication required." 
//     });
//   }
  
//   // Allow admin, manager, or the owner of the resource
//   if (req.user.role === "admin" || req.user.role === "manager") {
//     return next();
//   }
  
//   // For shop owners, check if they own the resource they're trying to access
//   if (req.user.role === "owner") {
//     // Assuming the resource has a shopId field that matches the user's shopId
//     if (req.params.shopId && req.params.shopId !== req.user.shopId) {
//       return res.status(403).json({ 
//         success: false,
//         message: "Access denied. You can only manage your own shop." 
//       });
//     }
    
//     return next();
//   }
  
//   return res.status(403).json({ 
//     success: false,
//     message: "Access denied. Insufficient privileges." 
//   });
// };

// // Optional: Rate limiting middleware for authentication endpoints
// const authRateLimiter = (req, res, next) => {
//   // Implement rate limiting logic here
//   // You can use a package like express-rate-limit
//   next();
// };

// module.exports = { 
//   authenticate, 
//   isAdmin, 
//   isManager, 
//   isManagerOrOwner,
//   authRateLimiter
// };




const jwt = require("jsonwebtoken");
const Manager = require("../models/Manager");

const authenticate = async (req, res, next) => {
  try {
    // Check for token in Authorization header
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Authentication token required" 
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-development');
    
    // Find the manager to ensure they still exist and are active
    const manager = await Manager.findById(decoded.id);
    
    if (!manager) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token. User not found." 
      });
    }

    if (!manager.isActive) {
      return res.status(401).json({ 
        success: false,
        message: "Account is deactivated. Please contact administrator." 
      });
    }

    // Attach user information to the request
    req.user = {
      id: manager._id,
      email: manager.email,
      role: manager.role,
      shop: manager.shop,
      shopId: manager.shop.id
    };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false,
        message: "Token expired. Please log in again." 
      });
    }
    
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token. Please log in again." 
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: "Authentication server error." 
    });
  }
};

module.exports = { authenticate };