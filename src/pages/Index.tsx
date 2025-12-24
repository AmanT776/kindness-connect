import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Search, Shield, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-500 via-blue-400 to-blue-600 py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 flex justify-center">
              <img
                src="/bduLogo.jpeg"
                alt="Bahir Dar University Logo"
                className="h-24 w-24 md:h-32 md:w-32 object-contain rounded-lg shadow-lg"
              />
            </div>
            <h1 className="font-heading text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-white">
              Bahir Dar University
              <span className="text-yellow-300"> Complaint Management System</span>
            </h1>
            <p className="mt-6 text-lg text-blue-100 md:text-xl">
              Submit, track, and resolve complaints efficiently. Whether you choose to remain anonymous or identified,
              your concerns will be heard and addressed professionally.
            </p>
            {!isAuthenticated ? (
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild className="w-full sm:w-auto">
                  <Link to="/submit">
                    <FileText className="mr-2 h-5 w-5" />
                    Submit a Complaint
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                  <Link to="/track">
                    <Search className="mr-2 h-5 w-5" />
                    Track Your Complaint
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild className="w-full sm:w-auto">
                  <Link to={user?.role === 'student' ? '/dashboard' : '/admin'}>
                    <FileText className="mr-2 h-5 w-5" />
                    Go to Dashboard
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold md:text-4xl">How It Works</h2>
            <p className="mt-3 text-muted-foreground">Simple, secure, and transparent complaint resolution</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Submit</CardTitle>
                <CardDescription>
                  File your complaint with all relevant details and supporting documents.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Stay Anonymous</CardTitle>
                <CardDescription>
                  Choose to submit anonymously if you prefer. Your identity is protected.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Track Progress</CardTitle>
                <CardDescription>
                  Monitor your complaint status in real-time using your reference number.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Get Resolution</CardTitle>
                <CardDescription>
                  Receive updates and resolutions from dedicated complaint officers.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      {isAuthenticated && (
        <section className="py-16 bg-muted/50">
          <div className="container">
            <Card>
              <CardHeader>
                <CardTitle>Welcome back, {user?.name}</CardTitle>
                <CardDescription>Quick access to your complaint management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button asChild>
                    <Link to={user?.role === 'student' ? '/dashboard' : '/admin'}>
                      Go to Dashboard
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/submit">Submit New Complaint</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-16 md:py-24">
          <div className="container">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-8 md:p-12 text-center">
                <h2 className="font-heading text-2xl font-bold md:text-3xl">
                  Have a concern? We're here to help.
                </h2>
                <p className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto">
                  Our dedicated team reviews every complaint and works towards fair and timely resolutions.
                  Your feedback helps us improve our services.
                </p>
                <Button size="lg" variant="secondary" className="mt-8" asChild>
                  <Link to="/submit">Submit Your Complaint</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Index;
