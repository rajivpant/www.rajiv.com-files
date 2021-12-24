#!/usr/local/bin/perl
# index.cgi
# by Rajiv Pant (Betul) http://rajiv.org for Netscape Communications
# Re: Netscape Technical Note 20021
# Turning off "automatic indexing" or showing only certain files


# --- user defines begin ---

$document_root = '/extra/web' ;

@exclude = # These are not displayed
(
'.zip',
'.c',
'.cgi'
) ;

%icons = # These are the icons for the displayed ones
(
'gif',	'image',
'jpg',	'image',
'jpeg',	'image',
'au',	'sound',
'bin',	'binary',
'txt',	'text',
'text',	'text'
) ;

$icon_back     ='back' ;
$icon_menu    = 'menu' ;
$icon_unknown = 'unknown' ;

# --- user defines end ---

require "ctime.pl" ;

$this_dir = `pwd` ;
$this_dir =~ s#^$document_root(.*)$#$1/# ;

&header ;
&get_files ;
&show_files ;


sub header
{
print <<EOM;
Content-type: text/html

EOM
}


sub get_files
{
opendir (THIS_DIR, ".") ;
@files = grep (!/^\.$/, readdir (THIS_DIR)) ;
close (THIS_DIR) ;
}

sub show_files
{

$long_line =
"<IMG SRC=\"/mc-icons/blank.gif\" ALT=\"     \">" .
"  Name                   Last modified     Size  Description" ;

print <<EOM;
<TITLE>Index of $this_dir</TITLE>
<h1>Index of $this_dir</h1>
<PRE>
$long_line
<HR>
EOM

foreach $file (sort @files)
  {
  $show = 1 ;
  foreach $exclude (@exclude)
    {
    if ($file =~ /$exclude$/) { $show = 0 ; }
    }
  if ($show)
    {
    $date_last_modified = (stat ($file))[9] ;
    @date_last_modified = split (" ", &ctime ($date_last_modified)) ;
    $day = $date_last_modified [2] ;
    $day = "0" . $day if (length ($day) == 1) ;
    $month = $date_last_modified [1] ;
    ($yr) = $date_last_modified [5] =~ m/(..)$/ ;
    ($time) = $date_last_modified [3] =~ m/^(\d{1,2}:\d{1,2})/ ;
    $last_modified = "$day-$month-$yr $time" ;
    $size = -s $file ;
    ($size > 1024) ? $size = int ($size / 1024) ."K"
    : ($size != 0) && ($size = "1K") ;
    $file_name_truncated = $file ;
    $file_name_truncated =~ s/^(.{21}).*/$1+/ ;
    ($ext) = $file =~ /\.([^\.]*)$/ ;
    $ext =~ tr/A-Z/a-z/ ;
    ($icon, $alt) = (defined ($icons{$ext})) ?
    ($icons{$ext}, "IMG") : ($icon_unknown, "   ") ;
    (-d $file) && ($icon = $icon_menu) ;
    if ($file eq '..')
      {
      $file_name_truncated = 'Parent Directory' ;
      $icon = $icon_back ;
      }
    $img_src = "<IMG SRC=\"/mc-icons/$icon.gif\" ALT=\"[$alt]\" BORDER=0>  " ;
    print "<a href=\"$file\" name=\"$file\">" , $img_src ;
    write
    }
  }
print "</pre>\n" ;
}


format STDOUT =
@<<<<<<<<<<<<<<<<<<<<< </a>@<<<<<<<<<<<<<<< @>>>>
$file_name_truncated, $last_modified, $size
.

# End of program listing.  Rajiv Pant betul@rajiv.org  http://rajiv.org
