import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  Button,
  Container,
  Grid,
  Stack,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { RESOURCE_CONFIGS, spaceContainsTags } from '../config/tags';

function Resources({ supabase }) {
  const [spaces, setSpaces] = useState([]);
  const [filteredSpaces, setFilteredSpaces] = useState([]);
  const [selectedLocationTag, setSelectedLocationTag] = useState('');
  const [selectedCategoryTags, setSelectedCategoryTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // 从配置文件获取标签
  const locationTags = RESOURCE_CONFIGS.locationTags;
  const resourceTypes = RESOURCE_CONFIGS.resourceTypes;
  const supportTypes = RESOURCE_CONFIGS.supportTypes;

  useEffect(() => {
    fetchSpaces();
  }, []);

  useEffect(() => {
    filterSpaces();
  }, [spaces, selectedLocationTag, selectedCategoryTags]);

  const fetchSpaces = async () => {
    try {
      const { data, error } = await supabase
        .from('spaces')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSpaces(data || []);
    } catch (err) {
      console.error('获取资源失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterSpaces = () => {
    let filtered = spaces;

    // 地区筛选 - 单选
    if (selectedLocationTag) {
      filtered = filtered.filter(space =>
        space.address?.toLowerCase().includes(selectedLocationTag.toLowerCase())
      );
    }

    // 支持类型筛选 - 多选
    if (selectedCategoryTags.length > 0) {
      filtered = filtered.filter(space =>
        spaceContainsTags(space, selectedCategoryTags)
      );
    }

    setFilteredSpaces(filtered);
  };

  const handleLocationTagClick = (tag) => {
    // 单选逻辑：如果点击的是已选中的标签，则取消选择；否则选择新标签
    setSelectedLocationTag(prev =>
      prev === tag ? '' : tag
    );
  };

  const handleCategoryTagClick = (tagLabel) => {
    setSelectedCategoryTags(prev =>
      prev.includes(tagLabel)
        ? prev.filter(t => t !== tagLabel)
        : [...prev, tagLabel]
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pt: 8,
        pb: 4
      }}
    >
      {/* Header */}
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              color: '#000',
              mb: 4,
              fontWeight: 'normal'
            }}
          >
            找到庇护，互相支持，每一条信息，都是一份力量。
          </Typography>
        </Box>

        {/* Location Tags */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Typography variant="h6" sx={{ color: '#000', mb: 1, fontWeight: 'bold' }}>
            地区
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{mb:2}}>
            {locationTags.map((tag, index) => (
              <Chip
                key={`${tag}-${index}`}
                label={`${tag} +`}
                onClick={() => handleLocationTagClick(tag)}
                sx={{
                  backgroundColor: selectedLocationTag === tag ? '#000' : 'rgba(0,0,0,0.1)',
                  color: selectedLocationTag === tag ? '#fff' : '#000',
                  border: '1px solid rgba(0,0,0,0.2)',
                  mb: 1,
                  '&:hover': {
                    backgroundColor: selectedLocationTag === tag ? '#333' : 'rgba(0,0,0,0.2)',
                  }
                }}
              />
            ))}
          </Stack>
          </Stack>
        </Box>

        {/* Resource Types */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#000', mb: 1, fontWeight: 'bold' }}>
            资源类型
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            {resourceTypes.map((tag) => (
              <Chip
                key={tag.value}
                label={`${tag.label} +`}
                onClick={() => handleCategoryTagClick(tag.label)}
                sx={{
                  backgroundColor: selectedCategoryTags.includes(tag.label) ? '#000' : 'rgba(0,0,0,0.1)',
                  color: selectedCategoryTags.includes(tag.label) ? '#fff' : '#000',
                  border: '1px solid rgba(0,0,0,0.2)',
                  mb: 1,
                  '&:hover': {
                    backgroundColor: selectedCategoryTags.includes(tag.label) ? '#333' : 'rgba(0,0,0,0.2)',
                  }
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Support Types */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#000', mb: 1, fontWeight: 'bold' }}>
            支持类型
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {supportTypes.map((tag) => (
              <Chip
                key={tag.value}
                label={`${tag.label} +`}
                onClick={() => handleCategoryTagClick(tag.label)}
                sx={{
                  backgroundColor: selectedCategoryTags.includes(tag.label) ? '#000' : 'rgba(0,0,0,0.1)',
                  color: selectedCategoryTags.includes(tag.label) ? '#fff' : '#000',
                  border: '1px solid rgba(0,0,0,0.2)',
                  mb: 1,
                  '&:hover': {
                    backgroundColor: selectedCategoryTags.includes(tag.label) ? '#333' : 'rgba(0,0,0,0.2)',
                  }
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Results Count */}
        <Typography variant="body1" sx={{ color: '#000', mb: 3, textAlign: 'center' }}>
          {filteredSpaces.length} results
        </Typography>

        {/* Resource Cards */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
            <CircularProgress size={60} sx={{ color: '#000' }} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredSpaces.map((space) => (
            <Grid item xs={12} sm={6} md={4} key={space.id}>
              <Card
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ color: '#000', mb: 1, fontWeight: 'bold' }}>
                    {space.name}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                      地址: {space.address}
                    </Typography>
                    {space.contact_phone && (
                      <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                        电话: {space.contact_phone}
                      </Typography>
                    )}
                    {space.email && (
                      <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                        邮箱: {space.email}
                      </Typography>
                    )}
                  </Box>

                  {space.additional_note && (
                    <Typography variant="body2" sx={{ color: '#333', mb: 2, fontSize: '0.9rem' }}>
                      {space.additional_note}
                    </Typography>
                  )}

                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      color: '#000',
                      borderColor: '#000',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        borderColor: '#000'
                      }
                    }}
                  >
                    learn more
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Add Resource Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                backgroundColor: 'rgba(255,255,255,0.5)',
                border: '2px dashed rgba(0,0,0,0.3)',
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.7)'
                }
              }}
              onClick={() => navigate('/resources/add')}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#666', mb: 2 }}>
                  +
                </Typography>
                <Typography variant="h6" sx={{ color: '#666' }}>
                  一起补充更多
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        )}
      </Container>
    </Box>
  );
}

export default Resources;
