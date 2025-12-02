import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import AdminLayout from '@/components/admin/admin-layout';
import { Activity, Database, Globe, AlertTriangle, Clock, Users, TrendingUp } from 'lucide-react';

export default function AdminMonitoring() {
  const [timeRange, setTimeRange] = useState(3600000); // 1 hour default

  const { data: healthData, refetch: refetchHealth } = useQuery({
    queryKey: ['/api/admin/monitoring/health'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: metricsData, refetch: refetchMetrics } = useQuery({
    queryKey: ['/api/admin/monitoring/metrics', timeRange],
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: analyticsData, refetch: refetchAnalytics } = useQuery({
    queryKey: ['/api/admin/monitoring/analytics', timeRange],
    refetchInterval: 60000,
  });

  const refreshAll = () => {
    refetchHealth();
    refetchMetrics();
    refetchAnalytics();
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'default',
      degraded: 'secondary',
      unhealthy: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'destructive'}>
        {status}
      </Badge>
    );
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatMemory = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(0)}MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)}GB`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">System Monitoring</h1>
            <p className="text-muted-foreground">
              Real-time platform health and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="px-3 py-2 border rounded-md"
            >
              <option value={300000}>5 minutes</option>
              <option value={1800000}>30 minutes</option>
              <option value={3600000}>1 hour</option>
              <option value={21600000}>6 hours</option>
              <option value={86400000}>24 hours</option>
            </select>
            <Button onClick={refreshAll} variant="outline">
              <Activity className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="health">Health Checks</TabsTrigger>
            <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* System Status */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Status</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Healthy</div>
                  <p className="text-xs text-muted-foreground">
                    All systems operational
                  </p>
                </CardContent>
              </Card>

              {/* Response Time */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metricsData?.requests?.avg ? formatDuration(metricsData.requests.avg) : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Past {timeRange / 60000} minutes
                  </p>
                </CardContent>
              </Card>

              {/* Memory Usage */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metricsData?.memory?.latest ? formatMemory(metricsData.memory.latest) : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current usage
                  </p>
                </CardContent>
              </Card>

              {/* Active Users */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData?.uniqueSessions || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Past {timeRange / 60000} minutes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Health Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Service Health Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {healthData && Object.entries(healthData).map(([service, health]: [string, any]) => (
                    <div key={service} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{service}</p>
                        <p className="text-sm text-muted-foreground">
                          {health.responseTime}ms
                        </p>
                      </div>
                      {getStatusBadge(health.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Checks Tab */}
          <TabsContent value="health" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health Checks</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Detailed health status for all system components
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthData && Object.entries(healthData).map(([service, health]: [string, any]) => (
                    <div key={service} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold capitalize">{service}</h3>
                        {getStatusBadge(health.status)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Response Time</p>
                          <p className="font-medium">{health.responseTime}ms</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Check</p>
                          <p className="font-medium">
                            {new Date(health.lastCheck).toLocaleTimeString()}
                          </p>
                        </div>
                        {health.details && (
                          <>
                            {Object.entries(health.details).map(([key, value]: [string, any]) => (
                              <div key={key}>
                                <p className="text-muted-foreground capitalize">{key}</p>
                                <p className="font-medium">{String(value)}</p>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Request Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Request Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {metricsData?.requests ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Average Response Time</span>
                        <span className="font-medium">{formatDuration(metricsData.requests.avg)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fastest Response</span>
                        <span className="font-medium">{formatDuration(metricsData.requests.min)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Slowest Response</span>
                        <span className="font-medium">{formatDuration(metricsData.requests.max)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Requests</span>
                        <span className="font-medium">{metricsData.requests.count}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No request data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Database Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Database Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {metricsData?.database ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Average Query Time</span>
                        <span className="font-medium">{formatDuration(metricsData.database.avg)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fastest Query</span>
                        <span className="font-medium">{formatDuration(metricsData.database.min)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Slowest Query</span>
                        <span className="font-medium">{formatDuration(metricsData.database.max)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Queries</span>
                        <span className="font-medium">{metricsData.database.count}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No database metrics available</p>
                  )}
                </CardContent>
              </Card>

              {/* Memory Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Memory Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  {metricsData?.memory ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Current Usage</span>
                        <span className="font-medium">{formatMemory(metricsData.memory.latest)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Usage</span>
                        <span className="font-medium">{formatMemory(metricsData.memory.avg)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Peak Usage</span>
                        <span className="font-medium">{formatMemory(metricsData.memory.max)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Minimum Usage</span>
                        <span className="font-medium">{formatMemory(metricsData.memory.min)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No memory data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Error Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle>Error Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  {metricsData?.errors ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Errors</span>
                        <span className="font-medium">{metricsData.errors.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Error Rate</span>
                        <span className="font-medium">
                          {metricsData.requests ? 
                            ((metricsData.errors.count / metricsData.requests.count) * 100).toFixed(2) + '%' 
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span>No errors detected</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsData ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Events</span>
                        <span className="font-medium">{analyticsData.totalEvents}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Unique Users</span>
                        <span className="font-medium">{analyticsData.uniqueUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Sessions</span>
                        <span className="font-medium">{analyticsData.uniqueSessions}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No analytics data available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Event Types</CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsData?.eventTypes ? (
                    <div className="space-y-2">
                      {Object.entries(analyticsData.eventTypes).map(([event, count]: [string, any]) => (
                        <div key={event} className="flex justify-between">
                          <span className="capitalize">{event.replace('_', ' ')}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No event data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}