// Standalone college data file
window.COLLEGE_DATA = {
  colleges: [
    {
      name: "ymca",
      slug: "ymca",
      id: "ymca",
      description: "Explore branches and Previous Year Question Papers",
      branches: [
        {
          name: "computer-engineering",
          slug: "computer-engineering",
          id: "computer-engineering",
          description: "Computer Engineering Branch",
          icon: "laptop-code",
          semesters: [
            {
              number: 3,
              slug: "sem3",
              id: "sem3",
              description: "Subjects for Semester 3",
              subjects: [
                {
                  name: "Analog Electronic Circuit",
                  description: "Study of electronic circuits and devices",
                  slug: "aec",
                  id: "aec",
                  pyqs: [
                    {
                      year: 2024,
                      file: "ymca-aec-2024.pdf",
                      id: "ymca-aec-2024",
                      pages: 8,
                      title: "Applied Electronic Circuit 2024"
                    }
                  ]
                },
                {
                  name: "Calculus and Ordinary Differential Equations",
                  description: "Mathematical concepts in engineering",
                  slug: "cde",
                  id: "cde",
                  pyqs: [
                    {
                      year: 2023,
                      file: "ymca-cde-2023.pdf",
                      id: "ymca-cde-2023",
                      pages: 10,
                      title: "Calculus and Ordinary Differential Equations 2023"
                    }
                  ]
                }
              ]
            },
            {
              number: 4,
              slug: "sem4",
              id: "sem4",
              description: "Subjects for Semester 4",
              subjects: [
                {
                  name: "Computer Organization and Architecture",
                  id: "coa",
                  description: "Fundamentals of computer systems",
                  slug: "coa",
                  pyqs: [
                    {
                      year: 2024,
                      file: "ymca-coa-2024.pdf",
                      id: "ymca-coa-2024",
                      pages: 12,
                      title: "Computer Organization and Architecture"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: "vit-bhopal",
      slug: "vit-bhopal",
      id: "vit-bhopal",
      description: "Explore branches and Previous Year Question Papers",
      branches: [
        {
          name: "computer-engineering",
          slug: "computer-engineering",
          id: "computer-engineering",
          description: "Computer Engineering Branch",
          icon: "microchip",
          semesters: [
            {
              number: 6,
              slug: "sem6",
              id: "sem6",
              description: "Subjects for Semester 6",
              subjects: [
                {
                  name: "Digital Logic Design",
                  slug: "digital-logic-design",
                  id: "digital-logic-design",
                  description: "Fundamentals of digital circuits",
                  icon: "circuit-board",
                  pyqs: [
                    {
                      year: 2022,
                      file: "vit-bhopal-digital-logic-design-2022.pdf",
                      id: "vit-bhopal-digital-logic-design-2022",
                      pages: 10,
                      title: "Digital Logic Design"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
