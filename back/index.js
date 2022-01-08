"use strict"

import dotenv from "dotenv"
dotenv.config()
import path from "path"
import express from "express"
import compression from "compression"
import bodyParser from "body-parser"
import passport from "passport"
import passportJWT from "passport-jwt"
import jwt from "jsonwebtoken"
import neo4j from "neo4j-driver"
// import db from './db.js';
import { fileURLToPath } from "url"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

;(async () => {
  const app = express()
  const port = process.env.PORT || 8080
  const JWTStrategy = passportJWT.Strategy
  const ExtractJWT = passportJWT.ExtractJwt

  const uri = process.env.NEOHOST
  const user = process.env.NEOUSER
  const password = process.env.NEOPASSWORD
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))

  const createToken = user => {
    return jwt.sign(
      {
        iss: "yaskevich",
        sub: user.id,
        iat: new Date().getTime(),
        exp: new Date().setDate(new Date().getDate() + 1),
      },
      process.env.JWT_SECRET
    )
  }

  const strategy = new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    function(jwtPayload, done) {
      return db
        .getUserDataByID(jwtPayload.sub)
        .then(user => {
          return done(null, user)
        })
        .catch(err => {
          return done(err)
        })
    }
  )

  passport.use(strategy)
  const auth = passport.authenticate("jwt", { session: false })
  // app.use(compression());
  // app.set('trust proxy', 1);
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(express.static("public"))

  app.post("/api/user/login", async (req, res) => {
    const userData = await db.getUserData(
      req.body["email"],
      req.body["password"]
    )
    if (
      userData &&
      Object.keys(userData).length &&
      !userData.hasOwnProperty("error")
    ) {
      console.log(req.body["email"], "<SUCCESS>")
      const token = createToken(userData)
      userData["token"] = token
      res.json(userData)
    } else {
      console.log(
        `login attempt as [${req.body["email"]}]•[${req.body["password"]}]►${
          userData.error
        }◄`
      )
      res.json(userData)
    }
  })

  app.get("/api/user/logout", (req, res) => {
    console.log("logging out")
    // You can add "issue time" to token and maintain "last logout time" for each user on the server.
    // When you check token validity, also check "issue time" be after "last logout time".
    // res.redirect('/login');
  })

  app.get("/api/test", async (req, res) => {
    console.log("GET params", req.params, "query", req.query)
    const session = driver.session()
    const person1Name = "Alice";
    const person2Name = "David";
    let data = [];
    try {
      // `MATCH (n) DETACH DELETE n`
      
      // const writeQuery = `MERGE (p1:Person { name: $person1Name })
      //                MERGE (p2:Person { name: $person2Name })
      //                 MERGE (p1)-[:KNOWS]->(p2)
      //                 RETURN p1, p2`
      // // Write transactions allow the driver to handle retries and transient errors
      // const writeResult = await session.writeTransaction(tx =>
      //   tx.run(writeQuery, { person1Name, person2Name })
      // )
      // writeResult.records.forEach(record => {
      //   const person1Node = record.get('p1')
      //   const person2Node = record.get('p2')
      //   console.log(
      //    `Created friendship between: ${person1Node.properties.name}, ${person2Node.properties.name}`
      //   )
      // })
      // const readQuery = `MATCH (p:Person) WHERE p.name = $personName RETURN p.name AS name`;
      // const readQuery = `MATCH (p:Person)-[:ACTED_IN]->(m:Movie) RETURN p, collect(m.title)`;

//       const readQuery = `MATCH (you {name:$personName})-[:KNOWS]->(friends)
// RETURN you, friends`
//       const readResult = await session.readTransaction(tx =>
//         tx.run(readQuery, { personName: person1Name })
//       );

      const readResult = await session.readTransaction(tx =>
        tx.run(`MATCH (user:Person) RETURN user`)
      );
      // console.log(person1Name,  readResult.records.map(x=> x.get('name')));
      // console.log(person1Name, readResult.records.map(x => x.get("friends")))
      //console.log(readResult.records.map(x => x.get("user").properties.name))
      data = readResult.records.map(x => x.get("user").properties);
    } catch (error) {
      console.error("Something went wrong: ", error)
    } finally {
      await session.close()
    }

    // res.json(await db...(req.query['id']));
    res.json(data)
  })

  const server = app.listen(port)
  // console.log(`Running at port ${port}`);
  // process.on('SIGINT', cleanup);
  // process.on('SIGTERM', cleanup);
  process.on("SIGINT", async () => {
    console.log("close server")
    await driver.close()
    server.close()
    process.exit()
  })
})()
