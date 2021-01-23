import { ApolloServer, gql } from "apollo-server-micro";
import jsonData from "../../public/remoteok.json";
const [metaInfo, ...data] = jsonData;

type NotIn = {
  NOT?: Array<string>;
  IN?: Array<string>;
};

type WhereJobs = {
  id?: NotIn;
  company?: string;
  position?: string;
  tags?: NotIn;
  description?: string;
  location?: string;
};

const resolvers = {
  Query: {
    info: () => {
      let { legal, explanation } = metaInfo;
      return {
        by: "@heygema",
        originAuthor: "levels.io",
        twitter: `https://twitter.com/levelsio`,
        source: "https://remoteok.io",
        legal,
        explanation
      };
    },
    job: (_parent: {}, { id }) => {
      return data.find((datum) => datum.id === id);
    },
    jobs: (_parent: {}, { where }: { where?: WhereJobs }) => {
      let {
        company = "",
        position = "",
        description = "",
        location = "",
        tags = {},
        id = {}
      } = where || {};

      let filtered = data.filter((datum) => {
        let idExist = datum.tags.some((tag) => {
          return (id.IN || []).includes(tag);
        });

        let idAvoid = datum.tags.some((tag) => {
          return (id.NOT || []).includes(tag);
        });

        let tagExist = datum.tags.some((tag) => {
          return (tags.IN || []).includes(tag);
        });

        let tagsAvoid = datum.tags.some((tag) => {
          return (tags.NOT || []).includes(tag);
        });
        let tagsCondition = true;
        let idsCondition = true;

        if (
          (tags.IN && tags.IN.length > 0) ||
          (tags.NOT && tags.NOT.length > 0)
        ) {
          tagsCondition = tagExist && !tagsAvoid;
        }

        if ((id.IN && id.IN.length > 0) || (id.NOT && id.NOT.length > 0)) {
          idsCondition = idExist && !idAvoid;
        }

        return (
          datum.company.includes(company) &&
          datum.position.includes(position) &&
          datum.description.includes(description) &&
          datum.location.includes(location) &&
          tagsCondition &&
          idsCondition
        );
      });
      return filtered;
    }
  }
};

const typeDefs = gql`
  type Query {
    info: Info!
    job(id: String!): Job
    jobs(where: WhereJobs, skip: Int, last: Int): [Job!]!
  }

  input NotOrIn {
    NOT: [String!]
    IN: [String!]
  }

  type Info {
    by: String!
    originAuthor: String!
    twitter: String!
    source: String!
    legal: String!
    explanation: String!
  }

  input WhereJobs {
    id: NotOrIn
    company: String
    position: String
    tags: NotOrIn
    description: String
    location: String
  }

  type Job {
    slug: String
    id: String
    epoch: String
    date: String
    company: String
    company_logo: String
    position: String
    tags: [String!]!
    description: String
    location: String
    url: String
    apply_url: String
  }
`;

const apolloServer = new ApolloServer({
  playground: true,
  typeDefs,
  resolvers
});

const handler = apolloServer.createHandler({ path: "/api" });

export const config = {
  api: {
    bodyParser: false
  }
};

export default handler;
