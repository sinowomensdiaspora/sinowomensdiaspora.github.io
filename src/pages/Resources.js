import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Box } from '@mui/material';

function Resources() {
  const discriminationInfo = {
    title: "Are Asians Majority or Minority?",
    description: "lorem ipsum",
    image: "/placeholder-protest.jpg"
  };

  const regionalResources = [
    { title: "Title", author: "Author", image: "/placeholder-1.jpg" },
    { title: "Title", author: "Author", image: "/placeholder-2.jpg" },
    { title: "Title", author: "Author", image: "/placeholder-3.jpg" }
  ];

  const supportContacts = [
    { title: "Title", author: "Author", image: "/placeholder-4.jpg" },
    { title: "Title", author: "Author", image: "/placeholder-5.jpg" },
    { title: "Title", author: "Author", image: "/placeholder-6.jpg" }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Main Article */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {discriminationInfo.title}
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          {discriminationInfo.description}
        </Typography>
        <Box
          component="img"
          src={discriminationInfo.image}
          alt="Protest"
          sx={{
            width: '100%',
            height: 400,
            objectFit: 'cover',
            borderRadius: 2,
            mb: 4
          }}
        />
        <Typography variant="h4" gutterBottom>
          There is no overreacting
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Types of discrimination
        </Typography>
      </Box>

      {/* Regional Resources */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" gutterBottom>
          Regional Resources
        </Typography>
        <Grid container spacing={3}>
          {regionalResources.map((resource, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={resource.image}
                  alt={resource.title}
                />
                <CardContent>
                  <Typography variant="h6">{resource.title}</Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {resource.author}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Support Contacts */}
      <Box>
        <Typography variant="h4" gutterBottom>
          Who can I speak to?
        </Typography>
        <Grid container spacing={3}>
          {supportContacts.map((contact, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={contact.image}
                  alt={contact.title}
                />
                <CardContent>
                  <Typography variant="h6">{contact.title}</Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {contact.author}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}

export default Resources;
